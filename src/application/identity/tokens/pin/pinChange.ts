import { IComponentOptions } from 'angular';
import { Credential } from "@digitalpersona/core";
import { IEnrollService, ServiceError } from '@digitalpersona/services';
import { PinEnroll } from '@digitalpersona/enrollment';

import template from './pinChange.html';
import { TokenEnroll } from '../tokenEnroll';

export default class PinChangeControl extends TokenEnroll
{
    public static readonly Component: IComponentOptions = {
        ...TokenEnroll.Component,
        template,
        controller: PinChangeControl,
    };

    private newPin : string;
    private showPin: boolean;

    public static $inject = ["EnrollService"];
    constructor(
        private enrollService: IEnrollService,
    ){
        super(Credential.Password);
    }

    public updateNewPin(value: string) {
        this.newPin = value || "";
        super.resetError();
    }

    public async submit() {
        super.emitOnBusy();
        try {
            await new PinEnroll(this.enrollService, this.changeToken)
                .enroll(this.identity, this.newPin, this.changeToken);
            super.emitOnEnroll();
        } catch (error) {
            super.emitOnError(new Error(this.mapServiceError(error)));
        }
    }

    public async deletePin() {
        super.emitOnBusy();
        try {
            await new PinEnroll(this.enrollService, this.changeToken)
                .unenroll(this.identity, this.changeToken);
            super.emitOnDelete();
        } catch (error) {
            super.emitOnError(new Error(this.mapServiceError(error)));
        }
    }

    private mapServiceError(error: ServiceError) {
        switch (error.code) {
            case -2147023570: return "PIN.Error.NoMatch";
            default: return error.message;
        }
    }
}
