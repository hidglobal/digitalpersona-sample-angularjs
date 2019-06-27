import { IWindowService } from 'angular';
import { JSONWebToken } from '@digitalpersona/core';

export default class IdentityService
{
    private static IDENTITY_KEY = "identity";

    public static $inject = ["$window"];
    constructor(
        private $window: IWindowService,
    ){
        console.log("IdentityService created");
    }

    public get() : JSONWebToken | null {
        return this.$window.sessionStorage.getItem(IdentityService.IDENTITY_KEY);
    }

    public set(identity: JSONWebToken) {
        this.$window.sessionStorage.setItem(IdentityService.IDENTITY_KEY, identity);
    }

    public clear() {
        this.$window.sessionStorage.removeItem(IdentityService.IDENTITY_KEY);
    }
}
