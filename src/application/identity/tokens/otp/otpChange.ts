import { IComponentOptions, IScope } from 'angular';
import QRCode from 'qrcode-generator';

import { TokenEnroll, Success } from '../tokenEnroll';
import template from './otpChange.html';
import { ServiceError } from '@digitalpersona/services';
import { Credential } from '@digitalpersona/core';
import { TimeOtpEnroll } from '@digitalpersona/enrollment';

type OtpType = 'Software' | 'Hardware';

export default class OtpChangeControl extends TokenEnroll
{
    public static readonly Component: IComponentOptions = {
        ...TokenEnroll.Component,
        template,
        controller: OtpChangeControl,
    };

    private static KEY_LENGTH = 20;

    private api: TimeOtpEnroll;

    private key: Uint8Array = new Uint8Array(OtpChangeControl.KEY_LENGTH);
    private keyUri: string;
    private qrCode: string;

    private selected: OtpType;

    private phoneNumber: string;
    private smsSent: boolean;

    private serialNumber: string;

    private otpCode: string;
    private showCode: boolean;

    public static $inject = ["$scope"];
    constructor($scope: IScope){
        super(Credential.OneTimePassword, $scope);
    }

    public async $onInit() {
        try {
            this.api = new TimeOtpEnroll(this.context);
            const crypto = window.crypto || window["msCrypto"];
            this.key = crypto.getRandomValues(this.key);
            this.keyUri = await this.api.createKeyUri(this.key);
            const qr = QRCode(10, "L");
            qr.addData(this.keyUri);
            qr.make();
            this.qrCode = qr.createDataURL();
        } finally {
            this.$scope.$apply();
        }
    }

    public select(otpType: OtpType) {
        this.selected = otpType;
    }

    public updateCode(value: string) {
        this.otpCode = value;
    }

    public canSubmit() {
        switch (this.selected) {
            case 'Software': return !!this.otpCode;
            case 'Hardware': return !!this.serialNumber && !!this.otpCode;
        }
    }

    public canSendSMS() {
        return !!this.phoneNumber;
    }

    public async sendSMS() {
        super.emitOnBusy();
        try {
            await this.api.sendVerificationCode(this.key, this.phoneNumber);
        } catch (error) {
            super.emitOnError(new Error(this.mapServiceError(error)));
        } finally {
            this.$scope.$apply();
        }
    }

    public async submit() {
        super.emitOnBusy();
        try {
            await this.api.enrollSoftwareOtp(this.otpCode, this.key, this.phoneNumber);
            delete this.selected;
            super.emitOnSuccess(new Success('OTP.Create.Success'));
        } catch (error) {
            super.emitOnError(new Error(this.mapServiceError(error)));
        } finally {
            this.$scope.$apply();
        }
    }

    public async deleteOtp() {
        super.emitOnBusy();
        try {
            await this.api.unenroll();
            super.emitOnSuccess(new Success('OTP.Delete.Success'));
        } catch (error) {
            super.emitOnError(new Error(this.mapServiceError(error)));
        } finally {
            this.$scope.$apply();
        }
    }

    protected mapServiceError(error: ServiceError) {
        switch (error.code) {
            case -2147023652: return "OTP.Create.Error.InvalidCode";
            default: return super.mapServiceError(error);
        }
    }
}
