import { IComponentOptions, IScope } from 'angular';
import { Credential } from "@digitalpersona/core";
import { TimeOtpAuth, PushOtpAuth, EmailOtpAuth, SmsOtpAuth  } from '@digitalpersona/authentication';
import { IAuthService, ServiceError } from '@digitalpersona/services';

import { TokenAuth, Success } from '../tokenAuth';
import template from './otpAuth.html';

type OtpMode = "time" | "email" | "sms" | "push";

export default class OtpAuthControl extends TokenAuth
{
    public static readonly Component: IComponentOptions = {
        ...TokenAuth.Component,
        template,
        controller: OtpAuthControl,
    };

    public code : string = "";

    private mode: OtpMode = "time";
    private challengeSent: boolean = false;

    public static $inject = ["$scope", "AuthService"];
    constructor(
        private $scope: IScope,
        private authService: IAuthService,
    ){
        super(Credential.OneTimePassword);
    }

    public $onInit() {
        this.mode = "time";
    }

    private resetMode() { this.mode = "time"; }

    public async sendChallenge(mode: OtpMode) {
        super.resetError();
        try {
            if (mode === "push") {
                this.mode = mode;
                this.emitOnUpdate();
                const token = await new PushOtpAuth(this.authService).authenticate(this.identity);
                super.emitOnToken(token);
                super.notify(new Success('OTP.Auth.Success'));
            }
            if (mode === "email") {
                this.mode = mode;
                this.challengeSent = false;
                await new EmailOtpAuth(this.authService).sendChallenge(this.user);
                this.challengeSent = true;
            }
            if (mode === "sms") {
                this.mode = mode;
                this.challengeSent = false;
                await new SmsOtpAuth(this.authService).sendChallenge(this.user);
                this.challengeSent = true;
            }
        }
        catch (error) {
            this.resetMode();
            this.emitOnError(new Error(this.mapServiceError(error)));
        } finally {
            this.$scope.$applyAsync();
        }
    }

    public needsCode(): boolean {
        return this.mode !== "push";
    }

    public updateCode(value: string) {
        this.code = value || "";
        super.notify();
    }

    public updateMode(mode: OtpMode) {
        this.mode = mode;
        super.notify();
    }

    public async submit() {
        super.emitOnBusy();
        try {
            const token = await (
                this.mode === "time"    ?   new TimeOtpAuth(this.authService).authenticate(this.identity, this.code) :
                this.mode === "email"   ?   new EmailOtpAuth(this.authService).authenticate(this.identity, this.code) :
                this.mode === "sms"     ?   new SmsOtpAuth(this.authService).authenticate(this.identity, this.code)
                                        :   new PushOtpAuth(this.authService).authenticate(this.identity)
            );
            super.emitOnToken(token);
            super.notify(new Success('OTP.Auth.Success'));
        }
        catch (error) {
            super.notify(new Error(this.mapServiceError(error)));
        }
        finally {
            this.$scope.$applyAsync();
        }
    }

    protected mapServiceError(error: ServiceError) {
        switch (error.code) {
            case -2147023652: return "OTP.Auth.Error.NoMatch";
            case -973143807: return "OTP.Auth.Error.NoPhone";
            case -2147024846: return "OTP.Auth.Error.NotSupported";
            default: return super.mapServiceError(error);

        }
    }
}
