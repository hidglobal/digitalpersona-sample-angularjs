import { Credential } from "@digitalpersona/core";
import { PasswordAuth } from '@digitalpersona/authentication';
import { IAuthService, ServiceError } from '@digitalpersona/services';
import { AuthController } from '../authController';

export default class PasswordAuthController extends AuthController
{
    public password : string = "";

    static $inject = ["AuthService"]
    constructor(
        private authService: IAuthService,
    ){
        super(Credential.Password);
    }

    updatePassword(value: string) {
        this.password = value || "";
        super.resetError();
    }

    submit() {
        super.emitOnBusy();
        new PasswordAuth(this.authService)
            .authenticate(this.identity, this.password)
            .then(token => super.emitOnToken(token))
            .catch(error => super.emitOnError(new Error(this.mapServiceError(error))));
        }
    mapServiceError(error: ServiceError) {
        switch(error.code) {
            case -2147023570: return "Password.Error.NoMatch";
            default: return error.message;
        }
    }
}
