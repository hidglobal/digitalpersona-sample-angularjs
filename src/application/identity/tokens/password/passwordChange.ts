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
        private enrollService: IEnrollService,
    ){
        super(Credential.Password);
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
            case -2147023570: return "Password.Error.NoMatch";
            default: return error.message;
        }
    }
}
