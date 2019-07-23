import { IComponentOptions } from 'angular';

import template from './alert.html';
import { Success, Warning, Info, StatusAlert } from '../../common';

export default class AlertControl
{
    public static readonly Component: IComponentOptions = {
        template,
        controller: AlertControl,
        bindings: {
            status: "<",
        },
    };

    public status: StatusAlert | null;

    public alertType() {
        return (this.status instanceof Error) ? 'alert-danger' :
        (this.status instanceof Warning) ? 'alert-warning' :
        (this.status instanceof Info) ? 'alert-info' :
        (this.status instanceof Success) ? 'alert-success' : '';
    }
}
