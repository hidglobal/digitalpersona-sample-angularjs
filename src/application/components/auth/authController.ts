import { User, JSONWebToken, JWT, ClaimName, CredentialId } from "@digitalpersona/core";

function errorMessage(code: number): string
{
    switch(code) {
        case -2147023521: return "This card is already enrolled";
        case -2147023570: return "Invalid user name or credential";
//        case -2147023579: return "Service time out";
        case -2147023579: return "The user is not enrolled";
        case -2147023652: return "Authentication failed";
        case -2147024239: return "PIN is too long";
        case -2147024281: return "PIN is too short";
        case -2147024288: return "Invalid card";
        case -2147024713: return "Duplicate hardware token";
        case -2147024809: return "Invalid argument";
        case -2147024810: return "Invalid password or user name";
        case -2147024846: return "The request is not supported";
//        case -2147024894: return "SMS is not enabled";
        case -2147024894: return "The service is not supported";
//        case -2147467263: return "This functionality is not yet implemented";
        case -2147467263: return "Invalid one-time password format";
        case -2147463155: return "Cannot assign the attribute";
        case -2146500063: return "Invalid SMS key";
        case -2146861013: return "Fingerprint already exists";
        case -2146893033: return "Time is out";
        case -2146893042: return "Phone number is not known";
        case -2146893044: return "Logon attempt failed";
//        case -2146893819: return "Bad data";                      //notCorrectSmartCardPIN
        case -2146893819: return "Invalid PIN";
        case -973143807 : return "Phone is not enrolled";
        default: return `Unknown error, code ${code}`
    }
}

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
        public supportedCredentials: CredInfo[]
    ){}
}

export interface AuthResult
{
    token?: JSONWebToken;
    error?: string;
}

export class AuthController
{
    public identity :  User|JSONWebToken;
    public onBusy   : () => void;
    public onUpdate : () => void;
    public onToken  : (locals: {token: JSONWebToken}) => void;
    public onError  : (locals: {error?: Error }) => void;
    public error    : string;

    constructor(
        public credId: CredentialId
    ){}

    public get user() : User {
        return (this.identity instanceof User)
            ? this.identity
            : new User(JWT.claims(this.identity)[ClaimName.WindowsAccountName] || "");
    }
    public isIdentified() {
        return this.identity && !(this.identity instanceof User);
    }
    public isAuthenticated() {
        if (this.identity instanceof User)
            return false;
        const creds = JWT.claims(this.identity)[ClaimName.CredentialsUsed];
        if (!creds) return false;
        return creds.findIndex(used =>
            used.id.toUpperCase() === this.credId
        ) >= 0;
    }

    protected emitOnBusy() {
        if (this.onBusy) this.onBusy();
    }
    protected emitOnUpdate() {
        if (this.onUpdate) this.onUpdate();
    }
    protected emitOnToken(token: JSONWebToken) {
        this.error = "";
        if (this.onToken) this.onToken({token})
    }
    protected emitOnError(error: Error) {
        this.error = error.message;
        if (this.onError) this.onError({error})
    }
    protected resetError() {
        this.error = "";
        if (this.onError) this.onError({})
    }

}
