import { IComponentOptions, IScope } from 'angular';
import QRCode from 'qrcode-generator';

import { TokenEnroll } from '../tokenEnroll';
import template from './otpChange.html';
import { IEnrollService, ServiceError } from '@digitalpersona/services';
import { Credential, Base64Url } from '@digitalpersona/core';
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

    private key: Uint8Array = new Uint8Array(OtpChangeControl.KEY_LENGTH);
    private keyUri: string;
    private qrCode: string;

    private selected: OtpType;

    private phoneNumber: string;
    private smsSent: boolean;

    private serialNumber: string;

    private otpCode: string;
    private showCode: boolean;

    public static $inject = ["EnrollService", "$scope"];
    constructor(
        enrollervice: IEnrollService,
        private readonly $scope: IScope,
    ){
        super(Credential.OneTimePassword, enrollervice);
    }

    public async $onInit() {
        try {
            const crypto = window.crypto || window["msCrypto"];
            this.key = crypto.getRandomValues(this.key);
            this.keyUri = await new TimeOtpEnroll(this.enrollService)
                .createKeyUri(this.identity, this.key);
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
            await new TimeOtpEnroll(this.enrollService)
                .sendVerificationCode(this.identity, this.key, this.phoneNumber);
        } catch (error) {
            super.emitOnError(new Error(this.mapServiceError(error)));
        } finally {
            this.$scope.$apply();
        }
    }

    public async submit() {
        super.emitOnBusy();
        try {
            await new TimeOtpEnroll(this.enrollService)
                .enrollSoftwareOtp(this.identity, this.otpCode, this.key, this.phoneNumber);
            delete this.selected;
            super.emitOnEnroll();
        } catch (error) {
            super.emitOnError(new Error(this.mapServiceError(error)));
        } finally {
            this.$scope.$apply();
        }
    }

    public async deleteOtp() {
        super.emitOnBusy();
        try {
            await new TimeOtpEnroll(this.enrollService)
                .unenroll(this.identity);
            super.emitOnDelete();
        } catch (error) {
            super.emitOnError(new Error(this.mapServiceError(error)));
        }

    }

    private mapServiceError(error: ServiceError) {
        switch (error.code) {
            case -2147023652: return "OTP.Create.Error.InvalidCode";
            case -2147024891: return "OTP.Create.Error.AccessDenied";
            default: return error.message;
        }
    }

    private toBase32(arr: Uint32Array): string {
        const base32 = {
            alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567",
            bits: 32,
            base: 5,
            remaining: 27,
        };

        const c = base32.alphabet;
        const bl = arr.byteLength * 8;

        let out = "";
        let i = 0;
        let bits = 0;
        let ta = 0;

        for (i = 0; out.length * base32.base < bl;) {
            out += c.charAt((ta ^ arr[i] >>> bits) >>> base32.remaining);
            if (bits < base32.base) {
                ta = arr[i] << (base32.base - bits);
                bits += base32.remaining;
                i++;
            } else {
                ta <<= base32.base;
                bits -= base32.base;
            }
        }

        return out;
    }

}
