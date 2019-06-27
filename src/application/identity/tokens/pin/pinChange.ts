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
        enrollService: IEnrollService,
    ){
        super(Credential.PIN, enrollService);
    }

    public updateNewPin(value: string) {
        this.newPin = value || "";
        super.resetError();
    }

    public async submit() {
        super.emitOnBusy();
        try {
            await new PinEnroll(this.enrollService)
                .enroll(this.identity, this.newPin);
            super.emitOnEnroll();
        } catch (error) {
            super.emitOnError(new Error(this.mapServiceError(error)));
        }
    }

    public async deletePin() {
        super.emitOnBusy();
        try {
            await new PinEnroll(this.enrollService)
                .unenroll(this.identity);
            super.emitOnDelete();
        } catch (error) {
            super.emitOnError(new Error(this.mapServiceError(error)));
        }
    }

    protected mapServiceError(error: ServiceError) {
        switch (error.code) {
            default: return super.mapServiceError(error);
        }
    }
}
