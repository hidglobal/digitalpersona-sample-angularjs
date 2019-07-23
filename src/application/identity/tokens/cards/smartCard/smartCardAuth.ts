import { IComponentOptions, IScope } from 'angular';
import { Credential } from "@digitalpersona/core";
import { SmartCardAuth } from '@digitalpersona/authentication';
import { IAuthService, ServiceError } from '@digitalpersona/services';
import { CardsReader, Card, CardType, CardInserted, CardRemoved } from '@digitalpersona/devices';

import { TokenAuth, Success } from '../../tokenAuth';
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

    public static $inject = ["$scope", "AuthService"];
    constructor(
        private $scope: IScope,
        private authService: IAuthService,
    ){
        super(Credential.SmartCard);
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
        try {
            const card = await this.reader.getCardInfo(ev.deviceId);
            if (card && card.Type === CardType.Contact) {
                this.card = card;
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
                super.notify(new Success('Cards.Auth.Success'));
            }
            catch (error) {
                super.emitOnError(new Error(this.mapServiceError(error)));
            }
        }
        catch (error) {
            super.emitOnError(new Error(this.mapDeviceError(error)));
        }
        finally {
            this.$scope.$applyAsync();
        }
    }

    protected mapServiceError(error: ServiceError): string {
        switch (error.code) {
            case -2147023652: return "Cards.Auth.Error.NoMatch";
            default: return super.mapServiceError(error);
        }
    }

    private mapDeviceError(error: Error): string {
        return error.message;
    }

}
