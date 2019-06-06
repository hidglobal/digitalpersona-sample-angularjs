import { IComponentOptions } from 'angular';

import template from './activityView.html';

export default class ActivityViewControl
{
    public static readonly Component: IComponentOptions = {
        template,
        controller: ActivityViewControl,
        transclude: true,
        bindings: {
            title: "<",
            error: "<",
            busy: "<",
        },
    };
}
