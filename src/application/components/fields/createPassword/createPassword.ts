import { IComponentOptions } from 'angular';
import 'angular-messages';
import 'font-awesome/scss/font-awesome.scss';

import template from './createPassword.html';

export default class CreatePasswordControl
{
    public static readonly Component: IComponentOptions = {
        template,
        controller: CreatePasswordControl,
        bindings: {
            name            : '@',  // field name (for the form posting)
            hidden          : '@',  // is the field hidden
            onChange        : '&',  // event fired when a password field is changed
        },
    };

    public name  : string;    // field name (for the form posting)
    public value : string;    // password value
    public confirm: string;   // password confirmation value

    private showPassword : boolean;

    public onChange     : (locals: { value: string }) => void; // event fired when a password field is changed

    public $onInit() {
        this.name       = this.name || "password";
        this.value      = "";
        this.showPassword = false;
    }

    public peek(show: boolean) {
        this.showPassword = show;
    }
}
