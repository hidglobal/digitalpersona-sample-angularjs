import { IComponentOptions, IScope } from 'angular';
import { Credential, BioSample } from "@digitalpersona/core";
import { FingerprintsAuth } from '@digitalpersona/authentication';
import { IAuthService, ServiceError } from '@digitalpersona/services';
import { FingerprintReader, QualityCode, ErrorOccurred } from '@digitalpersona/devices';

import { TokenAuth, Success } from '../tokenAuth';
import template from './fingerprintsAuth.html';

export default class FingerprintsAuthControl extends TokenAuth
{
    public static readonly Component: IComponentOptions = {
        ...TokenAuth.Component,
        template,
        controller: FingerprintsAuthControl,
        bindings: {
            ...TokenAuth.Component.bindings,
            reader: "<",
        },
    };

    public reader: FingerprintReader;

    private isReaderConnected: boolean = false;

    public static $inject = ["$scope", "AuthService"];
    constructor(
        private $scope: IScope,
        private authService: IAuthService,
    ){
        super(Credential.Fingerprints);
    }

    public $onInit() {
        this.reader.onDeviceConnected = async (device) => {
            await this.updateReaderStatus();
            this.$scope.$applyAsync();
        };
        this.reader.onDeviceDisconnected = async (device) => {
            await this.updateReaderStatus();
            this.$scope.$applyAsync();
        };
        this.reader.onQualityReported = (quality) => {
            this.updateSampleQuality(quality.quality);
            this.$scope.$applyAsync();
        };
        this.reader.onSamplesAcquired = async (data) => {
            await this.submit(data.samples);
            this.$scope.$applyAsync();
        };
        this.reader.onErrorOccurred = (reason) => {
            super.notify(new Error(this.mapDeviceError(reason)));
            this.$scope.$applyAsync();
        };
    }

    public $onDestroy() {
        this.reader.off();
    }

    private async updateReaderStatus() {
        try {
            const devices = await this.reader.enumerateDevices();
            this.isReaderConnected = devices.length > 0;
        } catch (err) {
            this.isReaderConnected = false;
            super.notify(new Error(this.mapDeviceError(err)));
        }
    }

    private updateSampleQuality(quality: QualityCode) {
        super.notify(quality !== QualityCode.Good
            ? new Error(`Fingerprints.QualityCode.${QualityCode[quality]}`)
            : undefined);
    }

    public async submit(samples: BioSample[]) {
        super.emitOnBusy();
        try {
            const auth = new FingerprintsAuth(this.authService);

            const token = await (this.user.name
                ? auth.authenticate(this.identity, samples)
                : auth.identify(samples));
            super.emitOnToken(token);
            super.notify(new Success('Fingerprints.Auth.Success'));
        }
        catch (error) {
            super.notify(new Error(this.mapServiceError(error)));
        }
    }

    protected mapServiceError(error: ServiceError): string {
        switch (error.code) {
            case -2146893044:
            case -2147023652:
                return "Fingerprints.Auth.Error.NoMatch";
            case -2146893042:
                return "Fingerprints.Auth.Error.NotEnrolled";
            default: return super.mapServiceError(error);
        }
    }

    private mapDeviceError(reason: ErrorOccurred) {
        switch (reason.error) {
            default: return (reason.error >>> 0).toString(16);
        }
    }
}
