import { IComponentOptions, IScope } from 'angular';
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

    private api: PinEnroll;
    private newPin : string;
    private showPin: boolean;

    public static $inject = ["$scope"];
    constructor(
        private readonly $scope: IScope,
    ){
        super(Credential.PIN);
    }

    public $onInit() {
        this.api = new PinEnroll(this.context);
    }

    public updateNewPin(value: string) {
        this.newPin = value || "";
        super.resetError();
    }

    public async submit() {
        super.emitOnBusy();
        try {
            await this.api.enroll(this.newPin);
            super.emitOnEnroll();
        } catch (error) {
            super.emitOnError(new Error(this.mapServiceError(error)));
        }
        finally {
            this.$scope.$apply();
        }
    }

    public async deletePin() {
        super.emitOnBusy();
        try {
            await this.api.unenroll();
            super.emitOnDelete();
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
