import { IComponentOptions } from 'angular';

import template from './alert.html';
import { Success } from '../../common';

export default class AlertControl
{
    public static readonly Component: IComponentOptions = {
        template,
        controller: AlertControl,
        bindings: {
            status: "<",
        },
    };

    public status: Error | Success | null;

    private isError() { return (this.status instanceof Error); }
}
