import { TokenEnroll } from '../tokenEnroll';
import { IComponentOptions } from 'angular';

import template from './fidoChange.html';
import { Credential } from '@digitalpersona/core';
import { IEnrollService, ServiceError, IAuthService } from '@digitalpersona/services';
import { U2FEnroll } from '@digitalpersona/enrollment';
import { U2FAuth } from '@digitalpersona/authentication';

export default class FidoChangeControl extends TokenEnroll
{
    public static readonly Component: IComponentOptions = {
        ...TokenEnroll.Component,
        template,
        controller: FidoChangeControl,
    };

    private started: boolean = false;

    public static $inject = ["AuthService", "EnrollService", "$scope"];
    constructor(
        private readonly authService: IAuthService,
        enrollService: IEnrollService,
        private readonly $scope: ng.IScope,
    ){
        super(Credential.U2F, enrollService);
    }

    public async $onInit() {
        this.isEnrolled = await this.getEnrolled();
        this.$scope.$apply();
    }

    public async start() {
        this.started = true;
        super.resetError();
        super.emitOnBusy();
        try {
            const appId = await new U2FAuth(this.authService).getAppId();

            await new U2FEnroll(appId, this.enrollService)
                .enroll(this.identity);
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
            const appId = await new U2FAuth(this.authService).getAppId();

            await new U2FEnroll(appId, this.enrollService)
                .unenroll(this.identity);
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
