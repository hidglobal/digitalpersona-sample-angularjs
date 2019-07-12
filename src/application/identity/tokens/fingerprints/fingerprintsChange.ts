import { IComponentOptions } from 'angular';
import { BioSample, Credential, FingerPosition, User } from '@digitalpersona/core';
import { IEnrollService, ServiceError } from '@digitalpersona/services';
import { FingerprintReader, ErrorOccurred, QualityCode, SampleFormat } from '@digitalpersona/devices';
import { FingerprintsEnroll } from '@digitalpersona/enrollment';

import { TokenEnroll, Success } from '../tokenEnroll';
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
    constructor($scope: ng.IScope) {
        super(Credential.Fingerprints, $scope);
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
            .catch(err => super.emitOnError(err));

    }

    public $onDestroy() {
        this.reader.stopAcquisition();
        this.reader.off();
        delete this.reader;
        delete this.samples;
    }

    private async updateReaderStatus() {
        try {
            const devices = await this.reader.enumerateDevices();
            this.isReaderConnected = devices && devices.length > 0;
        } catch (err) {
            this.isReaderConnected = false;
            super.emitOnError(new Error(this.mapDeviceError(err)));
        } finally {
            this.$scope.$apply();
        }
    }

    private updateSampleQuality(quality: QualityCode) {
        try {
            if (quality === QualityCode.Good)
                return super.resetStatus();
            super.emitOnError(new Error(`Fingerprints.QualityCode.${QualityCode[quality]}`));
        } finally {
            this.$scope.$apply();
        }
    }

    private allSamplesCollected() {
        return this.samples && this.samples.length >= this.minSamples;
    }

    private async addSamples(samples: BioSample[]) {
        this.samples.push(...samples);
        this.$scope.$apply();
        if (this.allSamplesCollected())
            await this.submit();
    }

    private async submit() {
        super.emitOnBusy();
        try {
            await new FingerprintsEnroll(this.context)
                .enroll(FingerPosition.RightIndex, this.samples);
            super.emitOnSuccess(new Success('Fingerprints.Create.Success'));
        } catch (error) {
            super.emitOnError(new Error(this.mapServiceError(error)));
        } finally {
            this.$scope.$apply();
        }
    }

    public async deleteFingerprints() {
        super.emitOnBusy();
        try {
            await new FingerprintsEnroll(this.context)
                .unenroll(undefined);
            super.emitOnSuccess(new Success('Fingerprints.Delete.Success'));
        } catch (error) {
            super.emitOnError(new Error(this.mapServiceError(error)));
        } finally {
            this.$scope.$apply();
        }
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
