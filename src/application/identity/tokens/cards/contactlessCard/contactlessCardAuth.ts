import { IComponentOptions } from 'angular';
import { Credential } from "@digitalpersona/core";
import { ContactlessCardAuth } from '@digitalpersona/authentication';
import { IAuthService, ServiceError } from '@digitalpersona/services';
import { CardsReader, CardType, CardInserted, Card, CardRemoved } from '@digitalpersona/devices';

import { TokenAuth } from '../../tokenAuth';
import template from './contactlessCardAuth.html';

export default class ContactlessCardAuthControl extends TokenAuth
{
    public static readonly Component: IComponentOptions = {
        ...TokenAuth.Component,
        template,
        controller: ContactlessCardAuthControl,
        bindings: {
            ...TokenAuth.Component.bindings,
            reader: "<",
        },
    };

    public reader: CardsReader;
    public card: Card | null = null;

    public static $inject = ["AuthService"];
    constructor(
        private authService: IAuthService,
    ){
        super(Credential.ContactlessCard);
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

    private handleCardInserted = async (ev: CardInserted) => {
        if (this.isAuthenticated()) return;
        try {
            const card = await this.reader.getCardInfo(ev.deviceId);
            if (!card || card.Type !== CardType.Contactless) return;
            this.card = card;
            super.emitOnBusy();
            const cardData = await this.reader.getCardAuthData(card.Reader);
            try {
                const service = new ContactlessCardAuth(this.authService);
                const token = await (this.user.name
                    ?  service.authenticate(this.identity, cardData)
                    :  service.identify(cardData)
                );
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

    private handleCardRemoved = (ev: CardRemoved) => {
        if (this.card && (this.card.Name === ev.cardId)) {
            this.card = null;
            super.emitOnUpdate();
        }
    }

    protected mapServiceError(error: ServiceError): string {
        switch (error.code) {
            case -2147023652:
            case -2147024288:
                return "Cards.Auth.Error.NoMatch";
            default: return super.mapServiceError(error);
        }
    }

    private mapDeviceError(error: Error): string {
        return error.message;
    }

}
