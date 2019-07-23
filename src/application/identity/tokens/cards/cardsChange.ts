import { IComponentOptions, IScope } from 'angular';

import { TokenEnroll, Success } from '../tokenEnroll';
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
        bindings: {
            ...TokenEnroll.Component.bindings,
        },
    };

    private reader: CardsReader = new CardsReader();
    private isReaderConnected: boolean = false;
    private cardsPresented: number = 0;

    public static $inject = ["$scope"];
    constructor($scope: IScope){
        super(Credential.Cards, $scope);
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
            this.emitOnError(new Error(this.mapDeviceError(error)));
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
            // super.emitOnUpdate();
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
                new SmartCardEnroll(this.context).unenroll(),
                new ContactlessCardEnroll(this.context).unenroll(),
                new ProximityCardEnroll(this.context).unenroll(),
            ];
            await Promise.all(deletions);
            super.emitOnSuccess(new Success('Cards.Delete.Success'));
        } catch (error) {
            super.emitOnError(new Error(this.mapServiceError(error)));
        } finally {
            this.$scope.$applyAsync();
        }
    }

    protected mapServiceError(error: ServiceError) {
        switch (error.code) {
            default: return super.mapServiceError(error);
        }
    }

    private mapDeviceError(error: Error) {
        return error.message;
    }

}
