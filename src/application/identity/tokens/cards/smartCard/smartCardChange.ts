import { IComponentOptions, IScope } from 'angular';
import { Credential } from '@digitalpersona/core';
import { IEnrollService, ServiceError } from '@digitalpersona/services';
import { CardsReader, Card, CardInserted, CardRemoved, CardType } from '@digitalpersona/devices';
import { SmartCardEnroll } from '@digitalpersona/enrollment';

import { TokenEnroll } from '../../tokenEnroll';
import template from './smartCardChange.html';

export default class SmartCardChangeControl extends TokenEnroll
{
    public static readonly Component: IComponentOptions = {
        ...TokenEnroll.Component,
        template,
        controller: SmartCardChangeControl,
        bindings: {
            ...TokenEnroll.Component.bindings,
            reader: "<",
        },
    };

    private reader: CardsReader;
    private cards: Card[] = [];
    private pin: string;
    private showPin: boolean;

    public static $inject = ["$scope"];
    constructor(
        private readonly $scope: IScope,
    ){
        super(Credential.SmartCard);
    }

    public $onInit() {
        // if a reader is not provided by a parent, work as a standalone component
        // Use multicast subscription here because several controlers will listen for several card types
        this.reader.on<CardInserted>("CardInserted", this.handleCardInserted);
        this.reader.on<CardRemoved>("CardRemoved", this.handleCardRemoved);
    }

    public $onDestroy() {
        this.reader.off("CardInserted", this.handleCardInserted);
        this.reader.off("CardRemoved", this.handleCardRemoved);
    }

    private handleCardInserted = async (ev: CardInserted) => {
        try {
            this.resetError();
            const card = await this.reader.getCardInfo(ev.deviceId);
            if (!card || card.Type !== CardType.Contact) return;
            this.cards.push(card);
        }
        catch (error) {
            super.emitOnError(new Error(this.mapDeviceError(error)));
        } finally {
            this.$scope.$apply();
        }
    }

    private handleCardRemoved = (ev: CardRemoved) => {
        this.resetError();
        const idx = this.cards.findIndex(c => c.Name === ev.cardId);
        if (idx < 0) return;
        this.cards.splice(idx);
        super.emitOnUpdate();
        this.$scope.$apply();
    }

    public updatePin(value: string) {
        this.resetError();
        this.pin = value || "";
    }

    public async submit(card: Card) {
        super.emitOnBusy();
        try {
            const data = await this.reader.getCardEnrollData(card.Reader, this.pin);
            await new SmartCardEnroll(this.context)
                .enroll(data);
            super.emitOnEnroll();
        } catch (error) {
            super.emitOnError(new Error(
                error instanceof ServiceError ?
                    this.mapServiceError(error) :
                    this.mapDeviceError(error)));
        } finally {
            this.$scope.$apply();
        }
    }

    protected mapServiceError(error: ServiceError) {
        switch (error.code) {
            default: return super.mapServiceError(error);
        }
    }

    private mapDeviceError(error: Error): string {
        switch (error.message) {
            case "0x80100014": return "SmartCard.Error.Unknown";
            case "0x8010006b": return "SmartCard.Error.InvalidPin";
            case "0x8010006c": return "SmartCard.Error.Blocked";
        }
        return error.message;
    }

}
