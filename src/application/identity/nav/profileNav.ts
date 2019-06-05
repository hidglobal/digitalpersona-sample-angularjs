import { IComponentOptions } from 'angular';
import { IdentityService } from '../../identity';

import template from './profileNav.html';

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

    private signout() {
        console.log('signout');
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
