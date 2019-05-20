import { Credential } from "@digitalpersona/core";
import { PinAuth } from '@digitalpersona/authentication';
import { IAuthService, ServiceError } from '@digitalpersona/services';
import { AuthController } from '../authController';

export default class PinAuthController extends AuthController
{
    public pin: string;

    static $inject = ["AuthService"]
    constructor(
        private authService: IAuthService,
    ){
        super(Credential.PIN);
    }

    updatePin(value: string) {
        this.pin = value || "";
        super.resetError();
    }

    submit() {
        super.emitOnBusy();
        new PinAuth(this.authService)
            .authenticate(this.identity, this.pin)
            .then(token => super.emitOnToken(token))
            .catch(error => super.emitOnError(new Error(this.mapServiceError(error))))
    }
    mapServiceError(error: ServiceError) {
        switch(error.code) {
            case -2146893044: return "PIN.Error.NoMatch";
            default: return error.message;
        }
    }
}
