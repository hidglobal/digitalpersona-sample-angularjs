import { IComponentOptions } from 'angular';
import { Credential } from "@digitalpersona/core";
import { TimeOtpAuth, PushOtpAuth, EmailOtpAuth, SmsOtpAuth  } from '@digitalpersona/authentication';
import { IAuthService, ServiceError } from '@digitalpersona/services';

import { TokenAuth } from '../tokenAuth';
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

    public static $inject = ["AuthService"];
    constructor(
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
            }
            if (mode === "email") {
                this.mode = mode;
                this.challengeSent = false;
                this.emitOnUpdate();
                await new EmailOtpAuth(this.authService).sendChallenge(this.user);
                this.challengeSent = true;
                super.emitOnUpdate();
            }
            if (mode === "sms") {
                this.mode = mode;
                this.challengeSent = false;
//                this.emitOnUpdate();
                await new SmsOtpAuth(this.authService).sendChallenge(this.user);
                this.challengeSent = true;
                super.emitOnUpdate();
            }
        }
        catch (error) {
            this.resetMode();
            this.emitOnError(new Error(this.mapServiceError(error)));
        }
    }

    public needsCode(): boolean {
        return this.mode !== "push";
    }

    public updateCode(value: string) {
        this.code = value || "";
        super.resetError();
    }

    public updateMode(mode: OtpMode) {
        this.mode = mode;
        super.resetError();
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
        }
        catch (error) {
            super.emitOnError(new Error(this.mapServiceError(error)));
        }
    }

    private mapServiceError(error: ServiceError) {
        switch (error.code) {
            case -2147023652: return "OTP.Error.NoMatch";
            case -973143807: return "OTP.Error.NoPhone";
            case -2147024846: return "OTP.Error.NotSupported";
            default: return error.message;
        }
    }
}
