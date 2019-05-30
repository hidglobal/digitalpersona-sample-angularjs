import { IComponentOptions } from 'angular';
import 'angular-messages';
import template from './username.html';

export default class UsernameControl
{
    public static readonly Component: IComponentOptions = {
        template,
        controller: UsernameControl,
        bindings: {
            value           : '@',
            name            : '@',  // field name (for the form posting)
            label           : '@',  // field label text
            placeholder     : '@',  // text to show inside the input field
            pattern         : '@',  // input pattern
            required        : '@',
            onChange        : '&',  // event fired when a password field is changed
        },
    };

    public name         : string;  // field name (for the form posting)
    public label        : string;  // field label text
    public placeholder  : string;  // text to show inside the input field
    public pattern      : string;  // input pattern
    public value        : string;  // username value
    public required     : boolean;

    public onChange     : (locals: {value: string}) => string|void;   // event fired when a password field is changed

    private error?: string;

    public $onInit() {
        this.name         = this.name || "username";
        this.label        = this.label || "Username";
    }

    public update() {
        this.error = this.onChange ? this.onChange({value: this.value}) || "" : "";
    }

}
