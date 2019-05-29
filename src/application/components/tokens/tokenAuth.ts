import { User, JSONWebToken, JWT, ClaimName, CredentialId } from "@digitalpersona/core";

export interface CredInfo {
    id: string;             // credential Id
    name: string;           // display name
    icon: string;           // icon
    canIdentify: boolean;   // supports identification
}

export class AuthState
{
    public isBusy: boolean;
    public error?: string;

    constructor(
        public supportedCredentials: CredInfo[],
    ){}
}

export interface AuthResult
{
    token?: JSONWebToken;
    error?: string;
}

export class TokenAuth
{
    protected static readonly Component: ng.IComponentOptions = {
        bindings: {
            identity: "<",
            onBusy: "&",
            onUpdate: "&",
            onToken: "&",
            onError: "&",
        },
    };

    public identity : User|JSONWebToken;
    public onBusy   : () => void;
    public onUpdate : () => void;
    public onToken  : (locals: {token: JSONWebToken}) => void;
    public onError  : (locals: {error?: Error }) => void;
    public error    : string;

    constructor(
        public credId: CredentialId,
    ){}

    public get user() : User {
        if (!this.identity) return User.Anonymous();
        if (this.identity instanceof User) return this.identity;
        return new User(JWT.claims(this.identity)[ClaimName.WindowsAccountName] || "");
    }
    public isIdentified() {
        return this.identity && !(this.identity instanceof User);
    }
    public isAuthenticated() {
        if (!this.identity || this.identity instanceof User)
            return false;
        const creds = JWT.claims(this.identity)[ClaimName.CredentialsUsed];
        if (!creds) return false;
        return creds.findIndex(used => used.id.toUpperCase() === this.credId) >= 0;
    }

    protected emitOnBusy() {
        if (this.onBusy) this.onBusy();
    }
    protected emitOnUpdate() {
        if (this.onUpdate) this.onUpdate();
    }
    protected emitOnToken(token: JSONWebToken) {
        this.error = "";
        if (this.onToken) this.onToken({token});
    }
    protected emitOnError(error: Error) {
        this.error = error.message;
        if (this.onError) this.onError({error});
    }
    protected resetError() {
        this.error = "";
        if (this.onError) this.onError({});
    }

}
