export default class PasswordFieldController
{
    public name         : string    // field name (for the form posting)
    public label        : string    // field label text
    public value        : string    // password value

    showPassword : boolean;

    public onChange     : Function; // event fired when a password field is changed

    $onInit() {
        this.name       = this.name || "password";
        this.label      = this.label || "Password";
        this.value      = "";
        this.showPassword = false;
    }
    peek(show: boolean) {
        this.showPassword = show;
    }
}
