import { IComponentOptions, IScope } from 'angular';
import { Credential } from "@digitalpersona/core";
import { PinAuth } from '@digitalpersona/authentication';
import { IAuthService, ServiceError } from '@digitalpersona/services';

import { TokenAuth, Success } from '../tokenAuth';
import template from './pinAuth.html';

export default class PinAuthControl extends TokenAuth
{
    public static readonly Component: IComponentOptions = {
        ...TokenAuth.Component,
        template,
        controller: PinAuthControl,
    };

    private pin: string;
    private showPin: boolean = false;

    public static $inject = ["$scope", "AuthService"];
    constructor(
        private $scope: IScope,
        private authService: IAuthService,
    ){
        super(Credential.PIN);
    }

    public updatePin(value: string) {
        this.pin = value || "";
        super.notify();
    }

    public async submit() {
        super.emitOnBusy();
        try {
            const api = new PinAuth(this.authService);
            const token = await api.authenticate(this.identity, this.pin);
            super.emitOnToken(token);
            super.notify(new Success('PIN.Auth.Success'));
        } catch (error) {
            super.notify(new Error(this.mapServiceError(error)));
        } finally {
            this.$scope.$applyAsync();
        }
    }

    protected mapServiceError(error: ServiceError) {
        switch (error.code) {
            case -2146893044: return "PIN.Auth.Error.NoMatch";
            case -2147024894: return "PIN.Auth.Error.NotEnrolled";
            default: return super.mapServiceError(error);
        }
    }
}
