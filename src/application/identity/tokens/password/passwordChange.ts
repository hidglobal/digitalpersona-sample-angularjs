import { IComponentOptions } from 'angular';
import { Credential, JSONWebToken } from "@digitalpersona/core";
import { IEnrollService, ServiceError } from '@digitalpersona/services';
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

    private newPassword : string;
    private oldPassword: string;
    private showPassword: boolean;

    public static $inject = ["EnrollService"];
    constructor(
        enrollService: IEnrollService,
    ){
        super(Credential.Password, enrollService);
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
            await new PasswordEnroll(this.enrollService, this.changeToken)
                .enroll(this.identity, this.newPassword, this.oldPassword, this.changeToken);
            super.emitOnEnroll();
        } catch (error) {
            super.emitOnError(new Error(this.mapServiceError(error)));
        }
    }

    private mapServiceError(error: ServiceError) {
        switch (error.code) {
            case -2147024891: return "Password.Create.Error.AccessDenied";
            default: return error.message;
        }
    }
}
