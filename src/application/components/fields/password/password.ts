import { IComponentOptions } from 'angular';
import 'angular-messages';
import 'font-awesome/scss/font-awesome.scss';

import template from './password.html';

export default class PasswordControl
{
    public static readonly Component: IComponentOptions = {
        template,
        controller: PasswordControl,
        bindings: {
            name            : '@',  // field name (for the form posting)
            label           : '@',  // field label text
            hidden          : '@',  // is the field hidden
            onChange        : '&',  // event fired when a password field is changed
        },
    };

    public name  : string;    // field name (for the form posting)
    public label : string;    // field label text
    public value : string;    // password value

    private showPassword : boolean;

    public onChange     : (locals: { value: string }) => void; // event fired when a password field is changed

    public $onInit() {
        this.name       = this.name || "password";
        this.label      = this.label || "Password";
        this.value      = "";
        this.showPassword = false;
    }

    public peek(show: boolean) {
        this.showPassword = show;
    }
}
