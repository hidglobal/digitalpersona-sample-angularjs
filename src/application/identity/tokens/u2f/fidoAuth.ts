import { IComponentOptions, IScope } from 'angular';
import { Credential } from '@digitalpersona/core';
import { AuthService, ServiceError } from '@digitalpersona/services';
import { U2FAuth } from '@digitalpersona/authentication';

import { TokenAuth, Success } from '../tokenAuth';
import template from './fidoAuth.html';

export default class FidoAuthControl extends TokenAuth
{
    public static readonly Component: IComponentOptions = {
        ...TokenAuth.Component,
        template,
        controller: FidoAuthControl,
    };

    private started: boolean = false;

    public static $inject = ["$scope", "AuthService"];
    constructor(
        private $scope: IScope,
        private authService: AuthService,
    ){
        super(Credential.U2F);
    }

    public async start() {
        this.started = true;
//      super.resetError();
//        this.notify();
        super.emitOnBusy();
        try {
            const api = new U2FAuth(this.authService);
            const token = await api.authenticate(this.identity);
            super.emitOnToken(token);
            super.notify(new Success('U2F.Auth.Success'));
        } catch (error) {
            super.notify(new Error(this.mapServiceError(error)));
        } finally {
            this.started = false;
            this.$scope.$applyAsync();
        }
    }

    protected mapServiceError(error: ServiceError) {
        switch (error.code) {
            case -2146893042: return "U2F.Auth.Error.NotEnrolled";
            default: return super.mapServiceError(error);
        }
    }
}
