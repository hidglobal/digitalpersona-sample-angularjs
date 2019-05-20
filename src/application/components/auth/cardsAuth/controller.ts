import { AuthController } from '../authController';
import { CardsReader } from '@digitalpersona/devices';
import { Credential, User, JWT, ClaimName } from '@digitalpersona/core';

export default class CardsAuthController extends AuthController
{
    public reader: CardsReader;

    private isReaderConnected: boolean = false;

    constructor(){
        super(Credential.Cards);
        this.reader = new CardsReader();
    }

    $onInit() {
        this.reader.onDeviceConnected =
        this.reader.onDeviceDisconnected = (device) => {
            this.updateReaderStatus(device.deviceId);
        }
        this.reader.on("CardInserted", this.handleCard);
        this.reader.on("CardRemoved", this.handleCard);
    }

    handleCard = () => {
        this.emitOnUpdate();
    }

    $onDestroy() {
        this.reader.off("CardInserted", this.handleCard);
        this.reader.off("CardRemoved", this.handleCard);
    }

    isAuthenticated() {
        if (this.identity instanceof User)
            return false;
        const authenticated = JWT.claims(this.identity)[ClaimName.CredentialsUsed];
        if (!authenticated) return false;
        const cardTypes = [ Credential.SmartCard, Credential.ContactlessCard, Credential.ProximityCard];
        return cardTypes.some(type => authenticated.map(used => used.id.toUpperCase()).includes(type));
    }

    isAllAuthenticated() {
        if (this.identity instanceof User)
            return false;
        const authenticated = JWT.claims(this.identity)[ClaimName.CredentialsUsed];
        if (!authenticated) return false;
        const cardTypes = [ Credential.SmartCard, Credential.ContactlessCard, Credential.ProximityCard];
        return cardTypes.every(type => authenticated.map(used => used.id.toUpperCase()).includes(type));
    }

    updateReaderStatus(device: string) {
        this.reader
            .enumerateReaders()
            .then(devices => {
                this.isReaderConnected = devices.length > 0;
                super.emitOnUpdate();
            })
            .catch(error => {
                this.isReaderConnected = false;
                super.emitOnError(new Error(this.mapDeviceError(error)))
            });
    }

    mapDeviceError(error: Error) {
        return error.message;
    }

}
