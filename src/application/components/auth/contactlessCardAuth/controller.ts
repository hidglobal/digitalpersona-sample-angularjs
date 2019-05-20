import { Credential } from "@digitalpersona/core";
import { ContactlessCardAuth } from '@digitalpersona/authentication';
import { IAuthService, ServiceError } from '@digitalpersona/services';
import { CardsReader, CardType, CardInserted, Card, CardRemoved } from '@digitalpersona/devices';
import { AuthController } from '../authController';

export default class ContactlessCardAuthController extends AuthController
{
    public reader: CardsReader;
    public card: Card | null = null;

    static $inject = ["AuthService"]
    constructor(
        private authService: IAuthService,
    ){
        super(Credential.ContactlessCard);
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
        if (this.isAuthenticated()) return;
        this.reader.getCardInfo(ev.deviceId).then(card => {
            if (card && card.Type === CardType.Contactless) {
                this.card = card;
                super.emitOnBusy();
                this.reader.getCardAuthData(card.Reader)
                .then(data => {
                    const auth = new ContactlessCardAuth(this.authService);
                    if (this.user.name) {
                        auth.authenticate(this.identity, data)
                            .then(token => super.emitOnToken(token))
                            .catch(error => super.emitOnError(new Error(this.mapServiceError(error))));
                    } else {
                        auth.identify(data)
                            .then(token => super.emitOnToken(token))
                            .catch(error => super.emitOnError(new Error(this.mapServiceError(error))));
                    }
                })
                .catch(error => super.emitOnError(error));
            };
        })
    }

    handleCardRemoved = (ev: CardRemoved) => {
        if (this.card && (this.card.Name == ev.cardId)) {
            this.card = null;
            super.emitOnUpdate();
        }
    }

    mapServiceError(error: ServiceError): string {
        switch(error.code) {
            case -2147023652:
            case -2147024288:
                return "Cards.Error.NoMatch";
            default: return error.message;
        }
    }

    mapDeviceError(error: Error): string {
        return error.message;
    }

}
