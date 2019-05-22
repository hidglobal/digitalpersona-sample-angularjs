import { Credential, BioSample } from "@digitalpersona/core";
import { FingerprintsAuth } from '@digitalpersona/authentication';
import { IAuthService, ServiceError } from '@digitalpersona/services';
import { FingerprintReader, QualityCode, ErrorOccurred } from '@digitalpersona/devices';
import { AuthController } from '../authController';

export default class FingerprintsAuthController extends AuthController
{
    public reader: FingerprintReader;

    private isReaderConnected: boolean = false;

    static $inject = ["AuthService"]
    constructor(
        private authService: IAuthService,
    ){
        super(Credential.Fingerprints);
    }

    $onInit() {
        this.reader.onDeviceConnected = (device) => {
            this.updateReaderStatus();
        }
        this.reader.onDeviceDisconnected = (device) => {
            this.updateReaderStatus();
        }
        this.reader.onQualityReported = (quality) => {
            this.updateSampleQuality(quality.quality);
        }
        this.reader.onSamplesAcquired = (data) => {
            this.submit(data.samples);
        }
        this.reader.onErrorOccurred = (reason) => {
            super.emitOnError(new Error(this.mapDeviceError(reason)));
        }
    }

    $onDestroy() {
        this.reader.off();
    }

    updateReaderStatus() {
        this.reader
            .enumerateDevices()
            .then(devices => {
                this.isReaderConnected = devices.length > 0;
                super.emitOnUpdate();
            })
            .catch(error => {
                this.isReaderConnected = false;
                super.emitOnError(new Error(this.mapDeviceError(error)))
            });
    }

    updateSampleQuality(quality: QualityCode) {
        if (quality == QualityCode.Good) {
            super.resetError();
            super.emitOnUpdate();
            return;
        }
        super.emitOnError(new Error(`fingerprints.QualityCode.${QualityCode[quality]}`));
    }

    async submit(samples: BioSample[]) {
        super.emitOnBusy();
        try {
            const auth = new FingerprintsAuth(this.authService);

            const token = await (this.user.name
                ? auth.authenticate(this.identity, samples)
                : auth.identify(samples));
            super.emitOnToken(token);
        }
        catch(error) {
            super.emitOnError(new Error(this.mapServiceError(error)));
        }
    }

    mapServiceError(error: ServiceError): string {
        switch(error.code) {
            case -2146893044:
            case -2147023652:
                return "Fingerprints.Error.NoMatch";
            default: return error.message;
        }
    }
    mapDeviceError(reason: ErrorOccurred) {
        switch(reason.error) {
            default: return (reason.error>>>0).toString(16);
        }
    }
}
