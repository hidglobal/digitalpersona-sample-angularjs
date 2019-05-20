import { Credential } from "@digitalpersona/core";
import { TimeOtpAuth, PushOtpAuth, EmailOtpAuth, SmsOtpAuth  } from '@digitalpersona/authentication';
import { IAuthService, ServiceError } from '@digitalpersona/services';
import { AuthController } from '../authController';

type OtpMode = "time" | "email" | "sms" | "push";

export default class OtpAuthController extends AuthController
{
    public code : string = "";
    private mode: OtpMode = "time";
    private challengeSent: boolean = false;

    static $inject = ["AuthService"]
    constructor(
        private authService: IAuthService,
    ){
        super(Credential.OneTimePassword);
    }

    $onInit() {
        this.mode = "time";
    }

    resetMode() { this.mode = "time" }
    resetError() { this.error = ""; }

    sendChallenge(mode: OtpMode) {
        super.resetError();
        if (mode === "push") {
            new PushOtpAuth(this.authService)
                .authenticate(this.identity)
                .then(token => super.emitOnToken(token))
                .catch(error => {
                    this.resetMode();
                    this.emitOnError(new Error(this.mapServiceError(error)));
                })
            this.mode = mode;
            return;
        }
        if (mode === "email") {
            this.challengeSent = false;
            new EmailOtpAuth(this.authService)
                .sendChallenge(this.user)
                .then(() => this.challengeSent = true)
                .catch(error => {
                    this.resetMode();
                    this.emitOnError(new Error(this.mapServiceError(error)));
                });
            this.mode = mode;
            return;
        }
        if (mode === "sms") {
            this.challengeSent = false;
            new SmsOtpAuth(this.authService)
                .sendChallenge(this.user)
                .then(() => this.challengeSent = true)
                .catch(error => {
                    this.resetMode();
                    this.emitOnError(new Error(this.mapServiceError(error)));
                });
            this.mode = mode;
        }
    }

    needsCode(): boolean { return this.mode !== "push"; }

    updateCode(value: string) {
        this.code = value || "";
        super.resetError();
    }

    updateMode(mode: OtpMode) {
        this.mode = mode;
        super.resetError();
    }

    submit() {
        super.emitOnBusy();
        (this.mode === "time"   ?   new TimeOtpAuth(this.authService).authenticate(this.identity, this.code) :
        this.mode === "email"   ?   new EmailOtpAuth(this.authService).authenticate(this.identity, this.code) :
        this.mode === "sms"     ?   new SmsOtpAuth(this.authService).authenticate(this.identity, this.code)
                                :   new PushOtpAuth(this.authService).authenticate(this.identity)
        ).then(token => super.emitOnToken(token))
        .catch(error => super.emitOnError(new Error(this.mapServiceError(error))));
    }

    mapServiceError(error: ServiceError) {
        switch(error.code) {
            case -2147023652: return "OTP.Error.NoMatch";
            case -973143807: return "OTP.Error.NoPhone";
            case -2147024846: return "OTP.Error.NotSupported"
            default: return error.message;
        }
    }
}
