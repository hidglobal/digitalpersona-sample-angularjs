import { TokenEnroll } from '../tokenEnroll';
import { IComponentOptions } from 'angular';

import template from './fidoChange.html';
import { Credential } from '@digitalpersona/core';
import { ServiceError, IAuthService } from '@digitalpersona/services';
import { U2FEnroll } from '@digitalpersona/enrollment';
import { U2FAuth } from '@digitalpersona/authentication';

export default class FidoChangeControl extends TokenEnroll
{
    public static readonly Component: IComponentOptions = {
        ...TokenEnroll.Component,
        template,
        controller: FidoChangeControl,
    };

    private api: U2FEnroll;
    private started: boolean = false;

    public static $inject = ["AuthService", "$scope"];
    constructor(
        private readonly authService: IAuthService,
        private readonly $scope: ng.IScope,
    ){
        super(Credential.U2F);
    }

    public async $onInit() {
        const appId = await new U2FAuth(this.authService).getAppId();
        this.api = new U2FEnroll(this.context, appId);
        this.isEnrolled = await this.getEnrolled();
        this.$scope.$apply();
    }

    public async start() {
        this.started = true;
        super.resetError();
        super.emitOnBusy();
        try {
            await this.api.enroll();
            this.isEnrolled = await super.getEnrolled();
            super.emitOnEnroll();
        } catch (error) {
            super.emitOnError(new Error(this.mapServiceError(error)));
        } finally {
            this.started = false;
            this.$scope.$apply();
        }
    }

    public async deleteFido() {
        super.emitOnBusy();
        try {
            await this.api.unenroll();
            this.isEnrolled = await super.getEnrolled();
            super.emitOnDelete();
        } catch (error) {
            super.emitOnError(new Error(this.mapServiceError(error)));
        } finally {
            this.$scope.$apply();
        }
    }

    protected mapServiceError(error: ServiceError) {
        switch (error.code) {
            default: return super.mapServiceError(error);
        }
    }


}
