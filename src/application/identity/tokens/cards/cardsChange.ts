import { IComponentOptions, IScope } from 'angular';

import { TokenEnroll } from '../tokenEnroll';
import template from './cardsChange.html';
import { CardsReader } from '@digitalpersona/devices';
import { Credential } from '@digitalpersona/core';
import { IEnrollService, ServiceError } from '@digitalpersona/services';
import { SmartCardEnroll, ProximityCardEnroll, ContactlessCardEnroll } from '@digitalpersona/enrollment';

export default class CardsChangeControl extends TokenEnroll
{
    public static readonly Component: IComponentOptions = {
        ...TokenEnroll.Component,
        template,
        controller: CardsChangeControl,
    };

    private reader: CardsReader = new CardsReader();
    private isReaderConnected: boolean = false;
    private cardsPresented: number = 0;

    public static $inject = ["EnrollService", "$scope"];
    constructor(
        enrollService: IEnrollService,
        private readonly $scope: IScope,
    ){
        super(Credential.Cards, enrollService);
    }

    public async $onInit() {
        this.reader.onDeviceConnected =
        this.reader.onDeviceDisconnected = (device) => {
            this.updateReaderStatus();
        };
        this.reader.on("CardInserted", this.onCardInserted);
        this.reader.on("CardRemoved", this.onCardRemoved);
        try {
            await this.reader.subscribe();
            this.updateReaderStatus();
        } catch (error) {
            this.error = this.mapDeviceError(error);
        } finally {
            this.$scope.$apply();
        }
    }

    public $onDestroy() {
        this.reader.off("CardInserted", this.onCardInserted);
        this.reader.off("CardRemoved", this.onCardRemoved);
        this.reader.unsubscribe();
    }

    private onCardInserted = () => {
        ++this.cardsPresented;
        this.$scope.$apply();
    }
    private onCardRemoved = () => {
        this.cardsPresented = Math.max(0, this.cardsPresented - 1);
        this.$scope.$apply();
    }

    private async updateReaderStatus() {
        try {
            const devices = await this.reader.enumerateReaders();
            this.isReaderConnected = devices.length > 0;
            super.emitOnUpdate();
        } catch (error) {
            this.isReaderConnected = false;
            super.emitOnError(new Error(this.mapDeviceError(error)));
        } finally {
            this.$scope.$apply();
        }
    }

    public async deleteAllCards() {
        super.emitOnBusy();
        try {
            const deletions = [
                new SmartCardEnroll(this.enrollService, this.changeToken).unenroll(this.identity),
                new ContactlessCardEnroll(this.enrollService, this.changeToken).unenroll(this.identity),
                new ProximityCardEnroll(this.enrollService, this.changeToken).unenroll(this.identity),
            ];
            await Promise.all(deletions);
            super.emitOnDelete();
        } catch (error) {
            super.emitOnError(new Error(this.mapServiceError(error)));
        }
    }

    private mapServiceError(error: ServiceError) {
        switch (error.code) {
            case -2147024891: return "Cards.Create.Error.AccessDenied";
            default: return error.message;
        }
    }

    private mapDeviceError(error: Error) {
        return error.message;
    }

}
