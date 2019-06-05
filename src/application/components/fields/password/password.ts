import { IComponentOptions, IOnChangesObject, IFormController, INgModelController } from 'angular';
import 'angular-messages';
import 'font-awesome/scss/font-awesome.scss';

import template from './password.html';

export default class PasswordControl
{
    public static readonly Component: IComponentOptions = {
        template,
        controller: PasswordControl,
        require: {
            parent: '^form',
        },
        bindings: {
            type            : '@',  // field type ('password' for a masked text or 'text' for a plain text)
            showPassword    : '=',  // a password peeker state; this value can be used to sync states of all password peekers on the form
            match           : '<?', // when defined, the field value must be equal to the provided value, or show a mismatch error
            name            : '@',  // field name (for the form posting)
            label           : '@',  // field label text
            hidden          : '@',  // is the field hidden
            onChange        : '&',  // event fired when a password field is changed
        },
    };

    public parent: IFormController;
    public type  : 'password' | 'text';
    public showPassword : boolean;
    public match? : string;
    public name  : string;    // field name (for the form posting)
    public label : string;    // field label text
    public value : string;    // password value

    // An event fired when a password field is changed.
    // Any nonempty string returned considered as a validation error and shown in the error area.
    public onChange     : (locals: { value: string }) => string|void;

    private showPeeker : boolean;
    private error?: string;

    public $onInit() {
        this.name       = this.name || "password";
        this.label      = this.label || "Password";
        this.value      = "";
        this.showPeeker = this.type !== 'text';
        this.showPassword = this.showPassword || false;
    }

    public $doCheck() {
        if (this.match)
            this.parent._form[this.name].$error.match = this.value !== this.match;
    }

    public update() {
        this.error = this.onChange ? this.onChange({value: this.value}) || "" : "";
    }

    public peek(show: boolean) {
        this.showPassword = show;
    }
}
