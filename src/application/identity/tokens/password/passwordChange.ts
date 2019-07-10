import { IComponentOptions, IScope } from 'angular';
import { Credential } from "@digitalpersona/core";
import { ServiceError } from '@digitalpersona/services';
import { PasswordEnroll } from '@digitalpersona/enrollment';

import template from './passwordChange.html';
import { TokenEnroll } from '../tokenEnroll';

export default class PasswordChangeControl extends TokenEnroll
{
    public static readonly Component: IComponentOptions = {
        ...TokenEnroll.Component,
        template,
        controller: PasswordChangeControl,
    };

    private api: PasswordEnroll;
    private newPassword : string;
    private oldPassword: string;
    private showPassword: boolean;

    public static $inject = ["$scope"];
    constructor(
        private readonly $scope: IScope,
    ){
        super(Credential.Password);
    }

    public $onInit() {
        this.api = new PasswordEnroll(this.context);
    }

    public updateOldPassword(value: string) {
        this.oldPassword = value || "";
        super.resetError();
    }
    public updateNewPassword(value: string) {
        this.newPassword = value || "";
        super.resetError();
    }

    public async submit() {
        super.emitOnBusy();
        try {
            await this.api.enroll(this.newPassword, this.oldPassword);
            super.emitOnEnroll();
        } catch (error) {
            super.emitOnError(new Error(this.mapServiceError(error)));
        }
        finally {
            this.$scope.$apply();
        }
    }

    protected mapServiceError(error: ServiceError) {
        switch (error.code) {
            default: return super.mapServiceError(error);
        }
    }
}
