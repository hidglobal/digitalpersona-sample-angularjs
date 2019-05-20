export default class UserNameController
{
    public name         : string;  // field name (for the form posting)
    public label        : string;  // field label text
    public placeholder  : string;  // text to show inside the input field
    public pattern      : string;  // input pattern
    public value        : string;  // username value
    public required     : boolean;

    public onChange       : Function;                    // event fired when a password field is changed

    $onInit() {
        this.name         = this.name || "username";
        this.label        = this.label || "Username";
    }
}
