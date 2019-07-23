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
    }

    public $onInit() {
        // Notice the use of arrow functions for event handlers for proper and effortless binding to `this`.
        this.reader.on("DeviceConnected", this.onReaderStatus);
        this.reader.on("DeviceDisconnected", this.onReaderStatus);
        this.reader.on("CardInserted", this.onCardInserted);
        this.reader.on("CardRemoved", this.onCardRemoved);
    }

    public $onDestroy() {
        this.reader.off("DeviceConnected", this.onReaderStatus);
        this.reader.off("DeviceDisconnected", this.onReaderStatus);
        this.reader.off("CardInserted", this.onCardInserted);
        this.reader.off("CardRemoved", this.onCardRemoved);
    }

    private onCardInserted = () => {
        ++this.cardsPresented;
        this.$scope.$applyAsync();
    }
    private onCardRemoved = () => {
        this.cardsPresented = Math.max(0, this.cardsPresented - 1);
        this.$scope.$applyAsync();
    }

    private onReaderStatus = async () => {
        try {
            const devices = await this.reader.enumerateReaders();
            this.isReaderConnected = devices.length > 0;
        } catch (err) {
            this.isReaderConnected = false;
            super.notify(new Error(this.mapDeviceError(err)));
        } finally {
            this.$scope.$applyAsync();
        }
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

    private mapDeviceError(error: Error) {
        return error.message;
    }

}
