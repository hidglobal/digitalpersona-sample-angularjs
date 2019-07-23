import { IComponentOptions, IScope } from 'angular';
import { Credential } from "@digitalpersona/core";
import { ProximityCardAuth } from '@digitalpersona/authentication';
import { IAuthService, ServiceError } from '@digitalpersona/services';
import { CardsReader, CardType, CardInserted, Card, CardRemoved } from '@digitalpersona/devices';

import { TokenAuth, Success } from '../../tokenAuth';
import template from './proximityCardAuth.html';

export default class ProximityCardAuthControl extends TokenAuth
{
    public static readonly Component: IComponentOptions = {
        ...TokenAuth.Component,
        template,
        controller: ProximityCardAuthControl,
        bindings: {
            ...TokenAuth.Component.bindings,
            reader: "<",
        },
    };

    public reader: CardsReader;

    public card: Card | null = null;

    public static $inject = ["$scope", "AuthService"];
    constructor(
        private $scope: IScope,
        private authService: IAuthService,
    ){
        super(Credential.ProximityCard);
    }

    public $onInit() {
        // Notice the use of arrow functions for event handlers for proper and effortless binding to `this`.
        if (!super.isAuthenticated()) {
            this.reader.on("CardInserted", this.handleCardInserted);
            this.reader.on("CardRemoved", this.handleCardRemoved);
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
            if (!card || card.Type !== CardType.Proximity) return;
            this.card = card;
            super.emitOnBusy();
            const cardData = await this.reader.getCardAuthData(card.Reader);
            try {
                const service = new ProximityCardAuth(this.authService);
                const token = await (this.user.name
                    ?  service.authenticate(this.identity, cardData)
                    :  service.identify(cardData)
                );
                super.emitOnToken(token);
                super.notify(new Success('Cards.Auth.Success'));
            }
            catch (error) {
                super.notify(new Error(this.mapServiceError(error)));
            }
        }
        catch (error) {
            super.notify(new Error(this.mapDeviceError(error)));
        }
        finally {
            this.$scope.$applyAsync();
        }
    }

    private handleCardRemoved = (ev: CardRemoved) => {
        if (this.card && (this.card.Name === ev.cardId)) {
            this.card = null;
            this.$scope.$applyAsync();
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
