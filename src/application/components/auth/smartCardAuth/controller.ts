import { Credential } from "@digitalpersona/core";
import { SmartCardAuth } from '@digitalpersona/authentication';
import { IAuthService, ServiceError } from '@digitalpersona/services';
import { CardsReader, Card, CardType, CardInserted, CardRemoved } from '@digitalpersona/devices';
import { AuthController } from '../authController';

export default class SmartcardAuthController extends AuthController
{
    public pin: string;
    public reader: CardsReader;

    private card: Card | null;

    static $inject = ["AuthService"]
    constructor(
        private authService: IAuthService,
    ){
        super(Credential.SmartCard);
    }

    $onInit() {
        // if a reader is not provided by a parent, work as a standalone component
        // Use multicast subscription here because several controlers will listen for several card types
        if (!super.isAuthenticated()) {
            this.reader.on<CardInserted>("CardInserted", this.handleCardInserted);
            this.reader.on<CardRemoved>("CardRemoved", this.handleCardRemoved);
        }
    }

    $onDestroy() {
        this.reader.off("CardInserted", this.handleCardInserted);
        this.reader.off("CardRemoved", this.handleCardRemoved);
    }

    handleCardInserted = (ev: CardInserted) => {
        this.reader.getCardInfo(ev.deviceId).then(info => {
            if (info && info.Type === CardType.Contact) {
                this.card = info;
                super.emitOnUpdate();
            };
        })
    }

    handleCardRemoved = (ev: CardRemoved) => {
        if (this.card && (this.card.Name === ev.cardId)) {
            this.card = null;
            super.emitOnUpdate();
        }
    }

    updatePin(value: string) {
        this.pin = value || "";
        super.resetError();
    }

    submit() {
        if (!this.card) return;
        super.emitOnBusy();
        // First use pin to obtain card data
        this.reader.getCardAuthData(this.card.Reader, this.pin)
            .then(data => {
                // Then send card data to the server
                new SmartCardAuth(this.authService)
                    .authenticate(this.identity, data)
                    .then(token => super.emitOnToken(token))
                    .catch(error => super.emitOnError(new Error(this.mapServiceError(error))));

            })
            .catch(error => super.emitOnError(error));
    }

    mapServiceError(error: ServiceError): string {
        switch(error.code) {
            case -2147023652: return "Cards.Error.NoMatch";
            default: return error.message;
        }
    }

    mapDeviceError(error: Error): string {
        return error.message;
    }

}
