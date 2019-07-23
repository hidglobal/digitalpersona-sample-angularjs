import { IComponentOptions, IScope } from 'angular';
import { Credential } from "@digitalpersona/core";
import { PasswordAuth } from '@digitalpersona/authentication';
import { IAuthService, ServiceError } from '@digitalpersona/services';

import { TokenAuth, Success } from '../tokenAuth';
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

    public static $inject = ["$scope", "AuthService"];
    constructor(
        private $scope: IScope,
        private authService: IAuthService,
    ){
        super(Credential.Password);
    }

    public updatePassword(value: string) {
        this.password = value || "";
        super.resetError();
    }

    public async submit() {
        super.emitOnBusy();
        try {
            const api = new PasswordAuth(this.authService);
            const token = await api.authenticate(this.identity, this.password);
            super.emitOnToken(token);
            super.notify(new Success('Password.Auth.Success'));
        } catch (error) {
            super.notify(new Error(this.mapServiceError(error)));
        } finally {
            this.$scope.$applyAsync();
        }
    }

    protected mapServiceError(error: ServiceError) {
        switch (error.code) {
            case -2147023570: return "Password.Auth.Error.NoMatch";
            default: return super.mapServiceError(error);
        }
    }
}
