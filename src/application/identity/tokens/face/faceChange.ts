import { IComponentOptions } from 'angular';
import { Credential, BioSample } from '@digitalpersona/core';

import { TokenEnroll } from '../tokenEnroll';
import template from './faceChange.html';
import { ServiceError } from '@digitalpersona/services';
import { FaceEnroll } from '@digitalpersona/enrollment';

export default class FaceChangeControl extends TokenEnroll
{
    public static readonly Component: IComponentOptions = {
        ...TokenEnroll.Component,
        template,
        controller: FaceChangeControl,
    };

    private capturing: boolean;

    public static $inject = ["$scope"];
    constructor(
        private readonly $scope: ng.IScope,
    ){
        super(Credential.Face);
    }

    public toggleCapture() {
        this.capturing = !this.capturing;
        this.$scope.$apply();
    }

    private handleStartCapture()
    {
    }
    private handleStopCapture()
    {
    }
    private handleCaptureError(error: Error) {
        super.emitOnError(error);
    }

    public async handleCaptured(samples: BioSample[]) {
        super.emitOnBusy();
        try {
            await new FaceEnroll(this.context)
                .enroll(samples);
            super.emitOnEnroll();
        } catch (error) {
            super.emitOnError(new Error(this.mapServiceError(error)));
        } finally {
            this.$scope.$apply();
        }
    }

    public async deleteFace() {
        super.emitOnBusy();
        try {
            await new FaceEnroll(this.context)
                .unenroll();
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
