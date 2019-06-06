import { IComponentOptions } from 'angular';
import { IdentityService } from '../../identity';

import template from './profileNav.html';
import { User } from '@digitalpersona/core';

export default class ProfileNavControl
{
    public static readonly Component: IComponentOptions = {
        template,
        controller: ProfileNavControl,
        bindings: {
            onSignin: '&',
            onSignout: '&',
        },
    };

    public readonly onSignin: () => boolean;
    public readonly onSignout: () => void;

    public static $inject = ["Identity"];
    constructor(
        private identity: IdentityService,
    ){
    }

    private get user() {
        const token = this.identity.get();
        return token ? User.fromJWT(token) : User.Anonymous();
    }

    private signout() {
        this.identity.clear();
        this.emitOnSignout();
    }

    private emitOnSignin() {
        return this.onSignin && this.onSignin();
    }

    private emitOnSignout() {
        return this.onSignout && this.onSignout();
    }
}
