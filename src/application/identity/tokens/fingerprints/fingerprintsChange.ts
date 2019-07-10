import { IComponentOptions } from 'angular';
import { BioSample, Credential, FingerPosition, User } from '@digitalpersona/core';
import { IEnrollService, ServiceError } from '@digitalpersona/services';
import { FingerprintReader, ErrorOccurred, QualityCode, SampleFormat } from '@digitalpersona/devices';
import { FingerprintsEnroll } from '@digitalpersona/enrollment';

import { TokenEnroll } from '../tokenEnroll';
import template from './fingerprintsChange.html';

import error from "./images/error.png";
import success from './images/success.png';
import warning from './images/warning.png';
import prompt from '../images/credentials/fingerprints.png';

export default class FingerprintsChangeControl extends TokenEnroll
{
    public static readonly Component: IComponentOptions = {
        ...TokenEnroll.Component,
        template,
        controller: FingerprintsChangeControl,
    };
    public readonly icons = {
        prompt,
        error,
        success,
        warning,
    };

    private busy: boolean;

    private reader: FingerprintReader;
    private isReaderConnected: boolean = false;

    private samples: BioSample[];
    private minSamples = 4;
    private minFingers = 1;
    private maxFingers = 10;

    public static $inject = ["$scope"];
    constructor(
        private readonly $scope: ng.IScope,
    ){
        super(Credential.Fingerprints);
    }

    public $onInit() {
        this.samples = [];
        this.reader = new FingerprintReader();

        this.reader.onDeviceConnected = (device) => {
            this.updateReaderStatus();
        };
        this.reader.onDeviceDisconnected = (device) => {
            this.updateReaderStatus();
        };
        this.reader.onQualityReported = (quality) => {
            this.updateSampleQuality(quality.quality);
        };
        this.reader.onSamplesAcquired = (data) => {
            this.addSamples(data.samples);
        };
        this.reader.onErrorOccurred = (reason) => {
            super.emitOnError(new Error(this.mapDeviceError(reason)));
        };

        this.reader
            .startAcquisition(SampleFormat.Intermediate)
            .then(() => this.$scope.$apply())
            .catch(err => this.showError(err));

    }

    public $onDestroy() {
        this.reader.stopAcquisition();
        this.reader.off();
        delete this.reader;
        delete this.samples;
    }

    private updateReaderStatus() {
        this.reader
            .enumerateDevices()
            .then(devices => {
                this.isReaderConnected = devices.length > 0;
                super.emitOnUpdate();
            })
            .catch(err => {
                this.isReaderConnected = false;
                super.emitOnError(new Error(this.mapDeviceError(err)));
            });
    }

    private updateSampleQuality(quality: QualityCode) {
        if (quality === QualityCode.Good) {
            super.resetError();
            super.emitOnUpdate();
            return;
        }
        super.emitOnError(new Error(`Fingerprints.QualityCode.${QualityCode[quality]}`));
    }

    private allSamplesCollected() {
        return this.samples && this.samples.length >= this.minSamples;
    }

    private async addSamples(samples: BioSample[]) {
        this.samples.push(...samples);
        if (this.allSamplesCollected()) {
            await this.submit();
        }
        this.$scope.$apply();
    }

    private async submit() {
        super.emitOnBusy();
        try {
            await new FingerprintsEnroll(this.context)
                .enroll(FingerPosition.RightIndex, this.samples);
            super.emitOnEnroll();
        } catch (error) {
            super.emitOnError(new Error(this.mapServiceError(error)));
        }
    }

    public async deleteFingerprints() {
        super.emitOnBusy();
        try {
            await new FingerprintsEnroll(this.context)
                .unenroll(undefined);
            super.emitOnDelete();
        } catch (error) {
            super.emitOnError(new Error(this.mapServiceError(error)));
        }
    }

    private showError(err: ServiceError|Error) {
        this.busy = false;
        if (this.error === err.message) return;
        if (err) {
            this.error = err.message;
        } else
            delete this.error;
        if (err instanceof ServiceError) {
            // if (error.code === -2146893033) {  // Authentication context expired, drop the token and replace with a user
            //     this.updateIdentity(this.getUser());
            // }
        }
//        $this.update();
    }

    protected mapServiceError(err: ServiceError) {
        switch (err.code) {
            default: return super.mapServiceError(err);
        }
    }

    private mapDeviceError(reason: ErrorOccurred) {
        switch (reason.error) {
            default: return (reason.error >>> 0).toString(16);
        }
    }

}
