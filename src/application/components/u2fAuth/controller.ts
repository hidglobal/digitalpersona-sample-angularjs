export default class U2FAuthController
{
    readerState: string;
    feedback: string;
    onSubmit: Function;

    $onInit() {
        this.readerState = "U2F is supported";
        this.feedback = "Insert your U2F token and touch it";
    }

}
