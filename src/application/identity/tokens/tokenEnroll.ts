import { JSONWebToken, JWT, ClaimName, CredentialId, User, UserNameType } from "@digitalpersona/core";

export class TokenEnroll
{
    protected static readonly Component: ng.IComponentOptions = {
        bindings: {
            identity: "<",
            changeToken: "<",
            onBusy: "&",
            onUpdate: "&",
            onEnroll: "&",
            onError: "&",
        },
    };

    public identity    : JSONWebToken;  // a token of a user changing/enrolling the credential
    public changeToken : JSONWebToken;  // a token permitting to change/enroll the credential (e.g. a security officer)
    public onBusy   : () => void;
    public onUpdate : () => void;
    public onEnroll : () => void;
    public onError  : (locals: {error?: Error }) => void;
    public error    : string;

    protected success: boolean;

    constructor(
        public credId: CredentialId,
    ){}

    public isEnrolled() {
//        if (this.identity)
        return false;
    }

    protected static getUser(token: JSONWebToken): User {
        const claims = JWT.claims(token);
        return  claims.sub && (claims.sub instanceof User) ? claims.sub :
                claims.wan ? new User(claims.wan) :
                claims.sub ? new User(claims.sub, UserNameType.DP) : User.Anonymous();
    }
    protected emitOnBusy() {
        this.success = false;
        if (this.onBusy) this.onBusy();
    }
    protected emitOnUpdate() {
        this.success = false;
        if (this.onUpdate) this.onUpdate();
    }
    protected emitOnEnroll() {
        this.error = "";
        this.success = true;
        if (this.onEnroll) this.onEnroll();
    }
    protected emitOnError(error: Error) {
        this.error = error.message;
        this.success = false;
        if (this.onError) this.onError({error});
    }
    protected resetError() {
        this.error = "";
        this.success = false;
        if (this.onError) this.onError({});
    }
}
