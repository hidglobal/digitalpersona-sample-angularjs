import { IComponentOptions, IScope } from 'angular';
import { Credential } from "@digitalpersona/core";
import { IEnrollService, ServiceError } from '@digitalpersona/services';
import { PinEnroll } from '@digitalpersona/enrollment';

import template from './pinChange.html';
import { TokenEnroll, Success } from '../tokenEnroll';

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
    constructor($scope: IScope){
        super(Credential.PIN, $scope);
    }

    public $onInit() {
        this.api = new PinEnroll(this.context);
    }

    public updateNewPin(value: string) {
        this.newPin = value || "";
        super.resetStatus();
    }

    public async submit() {
        super.emitOnBusy();
        try {
            await this.api.enroll(this.newPin);
            super.emitOnSuccess(new Success('PIN.Create.Success'));
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
            super.emitOnSuccess(new Success('PIN.Delete.Success'));
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
