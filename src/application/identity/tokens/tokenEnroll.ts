import { JSONWebToken, JWT, CredentialId, User, UserNameType } from "@digitalpersona/core";
import { IEnrollService, ServiceError } from '@digitalpersona/services';

export class TokenEnroll
{
    protected static readonly Component: ng.IComponentOptions = {
        bindings: {
            identity: "<",
            onBusy: "&",
            onUpdate: "&",
            onEnroll: "&",
            onDelete: "&",
            onError: "&",
        },
    };

    public identity : JSONWebToken;  // a token of a user changing/enrolling the credential
    public onBusy   : () => void;
    public onUpdate : () => void;
    public onEnroll : () => void;
    public onDelete : () => void;
    public onError  : (locals: {error?: Error }) => void;
    public error    : string;

    protected success: boolean;
    protected isEnrolled: boolean;

    constructor(
        public readonly credId: CredentialId,
        protected readonly enrollService: IEnrollService,
    ){}

    protected async getEnrolled() {
        const user = User.fromJWT(this.identity);
        try {
            const creds = (await this.enrollService.GetUserCredentials(user)).map(c => c.toUpperCase());
            return creds.includes(this.credId);
        } catch (e) {
            return false;
        }
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
    protected emitOnDelete() {
        this.error = "";
        this.success = true;
        if (this.onDelete) this.onDelete();
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
    protected mapServiceError(error: ServiceError) {
        switch (error.code) {
            case -2146893033:
            case -2147024891: return "Error.AccessDenied";
            case -2147023579: return 'Error.DoesNotExist';
            default: return error.message;
        }
    }

}
