import { IComponentOptions } from 'angular';
import { Credential } from '@digitalpersona/core';
import { AuthService, ServiceError } from '@digitalpersona/services';
import { U2FAuth } from '@digitalpersona/authentication';

import { TokenAuth } from '../tokenAuth';
import template from './fidoAuth.html';

export default class FidoAuthControl extends TokenAuth
{
    public static readonly Component: IComponentOptions = {
        ...TokenAuth.Component,
        template,
        controller: FidoAuthControl,
    };

    private started: boolean = false;

    public static $inject = ["AuthService"];
    constructor(
        private authService: AuthService,
    ){
        super(Credential.U2F);
    }

    public start() {
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
            });
    }

    protected mapServiceError(error: ServiceError) {
        switch (error.code) {
            case -2146893042: return "U2F.Error.NotEnrolled";
            default: return super.mapServiceError(error);
        }
    }
}
