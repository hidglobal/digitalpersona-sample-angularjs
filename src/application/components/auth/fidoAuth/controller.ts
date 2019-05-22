import { AuthController } from '../authController';
import { Credential } from '@digitalpersona/core';
import { AuthService, ServiceError } from '@digitalpersona/services';
import { U2FAuth } from '@digitalpersona/authentication';

export default class FidoAuthController extends AuthController
{
    private started: boolean = false;

    static $inject = ["AuthService"]
    constructor(
        private authService: AuthService
    ){
        super(Credential.U2F)
    }

    start() {
        this.started = true;
        super.resetError();
        super.emitOnBusy();
        new U2FAuth(this.authService)
            .authenticate(this.identity)
            .then(token => super.emitOnToken(token))
            .catch(error => super.emitOnError(new Error(this.mapServiceError(error))))
            .finally(() => {
                this.started = false;
                super.emitOnUpdate();
            })
    }

    mapServiceError(error: ServiceError) {
        switch(error.code) {
            case -2146893042: return "U2F.Error.NotSupported";
            default: return error.message;
        }
    }
}
