import { IComponentOptions } from 'angular';
import { Credential } from "@digitalpersona/core";
import { PasswordAuth } from '@digitalpersona/authentication';
import { IAuthService, ServiceError } from '@digitalpersona/services';

import { TokenAuth } from '../tokenAuth';
import template from './passwordAuth.html';

export default class PasswordAuthControl extends TokenAuth
{
    public static readonly Component: IComponentOptions = {
        ...TokenAuth.Component,
        template,
        controller: PasswordAuthControl,
    };

    private showPassword: boolean = false;
    private password : string = "";

    public static $inject = ["AuthService"];
    constructor(
        private authService: IAuthService,
    ){
        super(Credential.Password);
    }

    public updatePassword(value: string) {
        this.password = value || "";
        super.resetError();
    }

    public submit() {
        super.emitOnBusy();
        new PasswordAuth(this.authService)
            .authenticate(this.identity, this.password)
            .then(token => super.emitOnToken(token))
            .catch(error => super.emitOnError(new Error(this.mapServiceError(error))));
    }

    protected mapServiceError(error: ServiceError) {
        switch (error.code) {
            case -2147023570: return "Password.Auth.Error.NoMatch";
            default: return super.mapServiceError(error);
        }
    }
}
