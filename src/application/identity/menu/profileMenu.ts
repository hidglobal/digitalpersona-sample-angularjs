import { IComponentOptions } from 'angular';

import template from './profile.html';

export default class ProfileControl
{
    public static readonly Component: IComponentOptions = {
        template,
        controller: ProfileControl,
    };
}
