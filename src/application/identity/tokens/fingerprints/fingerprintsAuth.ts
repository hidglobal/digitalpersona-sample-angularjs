import { IComponentOptions } from 'angular';
import { Credential, BioSample } from "@digitalpersona/core";
import { FingerprintsAuth } from '@digitalpersona/authentication';
import { IAuthService, ServiceError } from '@digitalpersona/services';
import { FingerprintReader, QualityCode, ErrorOccurred } from '@digitalpersona/devices';

import { TokenAuth } from '../tokenAuth';
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

    public static $inject = ["AuthService"];
    constructor(
        private authService: IAuthService,
    ){
        super(Credential.Fingerprints);
    }

    public $onInit() {
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
            this.submit(data.samples);
        };
        this.reader.onErrorOccurred = (reason) => {
            super.emitOnError(new Error(this.mapDeviceError(reason)));
        };
    }

    public $onDestroy() {
        this.reader.off();
    }

    private updateReaderStatus() {
        this.reader
            .enumerateDevices()
            .then(devices => {
                this.isReaderConnected = devices.length > 0;
                super.emitOnUpdate();
            })
            .catch(error => {
                this.isReaderConnected = false;
                super.emitOnError(new Error(this.mapDeviceError(error)));
            });
    }

    private updateSampleQuality(quality: QualityCode) {
        if (quality === QualityCode.Good) {
            super.resetError();
            super.emitOnUpdate();
            return;
        }
        this.error = `Fingerprints.QualityCode.${QualityCode[quality]}`;
    }

    public async submit(samples: BioSample[]) {
        super.emitOnBusy();
        try {
            const auth = new FingerprintsAuth(this.authService);

            const token = await (this.user.name
                ? auth.authenticate(this.identity, samples)
                : auth.identify(samples));
            super.emitOnToken(token);
        }
        catch (error) {
            super.emitOnError(new Error(this.mapServiceError(error)));
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
