import { IComponentOptions } from 'angular';
import { IdentityService } from '../identity';

import template from './home.html';

export default class HomeControl
{
    public static Component: IComponentOptions = {
        template,
        controller: HomeControl,
    };

    public static $inject = ["Identity"];
    constructor(
        private identity: IdentityService,
    ){}
}
