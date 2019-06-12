import { IComponentOptions } from 'angular';
import { Credential } from "@digitalpersona/core";
import { SmartCardAuth } from '@digitalpersona/authentication';
import { IAuthService, ServiceError } from '@digitalpersona/services';
import { CardsReader, Card, CardType, CardInserted, CardRemoved } from '@digitalpersona/devices';

import { TokenAuth } from '../../tokenAuth';
import template from './smartCardAuth.html';

export default class SmartCardAuthControl extends TokenAuth
{
    public static readonly Component: IComponentOptions = {
        ...TokenAuth.Component,
        template,
        controller: SmartCardAuthControl,
        bindings: {
            ...TokenAuth.Component.bindings,
            reader: "<",
        },
    };

    public reader: CardsReader;
    private card: Card | null;
    private pin: string;
    private showPin: boolean;

    public static $inject = ["AuthService"];
    constructor(
        private authService: IAuthService,
    ){
        super(Credential.SmartCard);
    }

    public $onInit() {
        // if a reader is not provided by a parent, work as a standalone component
        // Use multicast subscription here because several controlers will listen for several card types
        if (!super.isAuthenticated()) {
            this.reader.on<CardInserted>("CardInserted", this.handleCardInserted);
            this.reader.on<CardRemoved>("CardRemoved", this.handleCardRemoved);
        }
    }

    public $onDestroy() {
        this.reader.off("CardInserted", this.handleCardInserted);
        this.reader.off("CardRemoved", this.handleCardRemoved);
    }

    private handleCardInserted = (ev: CardInserted) => {
        this.reader.getCardInfo(ev.deviceId).then(info => {
            if (info && info.Type === CardType.Contact) {
                this.card = info;
                super.emitOnUpdate();
            }
        });
    }

    private handleCardRemoved = (ev: CardRemoved) => {
        if (this.card && (this.card.Name === ev.cardId)) {
            this.card = null;
            super.emitOnUpdate();
        }
    }

    public updatePin(value: string) {
        this.pin = value || "";
        super.resetError();
    }

    public async submit() {
        if (!this.card) return;
        super.emitOnBusy();
        try {
            // First use pin to obtain card data
            const cardData = await this.reader.getCardAuthData(this.card.Reader, this.pin);
            try {
                // Then send card data to the server
                const token = await new SmartCardAuth(this.authService).authenticate(this.identity, cardData);
                super.emitOnToken(token);
            }
            catch (error) {
                super.emitOnError(new Error(this.mapServiceError(error)));
            }
        }
        catch (error) {
            super.emitOnError(new Error(this.mapDeviceError(error)));
        }
    }

    private mapServiceError(error: ServiceError): string {
        switch (error.code) {
            case -2147023652: return "Cards.Auth.Error.NoMatch";
            default: return error.message;
        }
    }

    private mapDeviceError(error: Error): string {
        return error.message;
    }

}
