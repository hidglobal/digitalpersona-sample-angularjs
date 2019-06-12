import { IComponentOptions, IScope } from 'angular';
import { Credential, User, JWT, ClaimName } from '@digitalpersona/core';
import { CardsReader } from '@digitalpersona/devices';

import { TokenAuth } from '../tokenAuth';
import template from './cardsAuth.html';

export default class CardsAuthControl extends TokenAuth
{
    public static readonly Component: IComponentOptions = {
        ...TokenAuth.Component,
        template,
        controller: CardsAuthControl,
        transclude: true,
        bindings: {
            ...TokenAuth.Component.bindings,
            reader: "<",
        },
    };

    public reader: CardsReader;
    public cardsPresented: number = 0;

    private isReaderConnected: boolean = false;

    public static $inject = ["$scope"];
    constructor(
        private readonly $scope: IScope,
    ){
        super(Credential.Cards);
        this.reader = new CardsReader();
    }

    public $onInit() {
        this.reader.onDeviceConnected =
        this.reader.onDeviceDisconnected = (device) => {
            this.updateReaderStatus(device.deviceId);
        };
        this.reader.on("CardInserted", this.onCardInserted);
        this.reader.on("CardRemoved", this.onCardRemoved);
    }

    public $onDestroy() {
        this.reader.off("CardInserted", this.onCardInserted);
        this.reader.off("CardRemoved", this.onCardRemoved);
    }

    private onCardInserted = () => {
        ++this.cardsPresented;
        super.emitOnUpdate();
    }
    private onCardRemoved = () => {
        this.cardsPresented = Math.max(0, this.cardsPresented - 1);
        super.emitOnUpdate();
    }

    public isAuthenticated() {
        if (this.identity instanceof User)
            return false;
        const authenticated = JWT.claims(this.identity)[ClaimName.CredentialsUsed];
        if (!authenticated) return false;
        const cardTypes = [ Credential.SmartCard, Credential.ContactlessCard, Credential.ProximityCard];
        return cardTypes.some(type => authenticated.map(used => used.id.toUpperCase()).includes(type));
    }

    public isAllAuthenticated() {
        if (this.identity instanceof User)
            return false;
        const authenticated = JWT.claims(this.identity)[ClaimName.CredentialsUsed];
        if (!authenticated) return false;
        const cardTypes = [ Credential.SmartCard, Credential.ContactlessCard, Credential.ProximityCard];
        return cardTypes.every(type => authenticated.map(used => used.id.toUpperCase()).includes(type));
    }

    private updateReaderStatus(device: string) {
        this.reader
            .enumerateReaders()
            .then(devices => {
                this.isReaderConnected = devices.length > 0;
                super.emitOnUpdate();
            })
            .catch(error => {
                this.isReaderConnected = false;
                super.emitOnError(new Error(this.mapDeviceError(error)));
            });
    }

    private mapDeviceError(error: Error) {
        return error.message;
    }

}
