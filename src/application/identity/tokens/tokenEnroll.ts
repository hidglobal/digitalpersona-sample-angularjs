import { CredentialId } from "@digitalpersona/core";
import { ServiceError } from '@digitalpersona/services';
import { EnrollmentContext } from '@digitalpersona/enrollment';
import { Success } from '../../common';
export { Success } from '../../common';

export class TokenEnroll
{
    protected static readonly Component: ng.IComponentOptions = {
        bindings: {
            context: "<",
            onBusy: "&",
            onUpdate: "&",
            onSuccess: "&",
            onError: "&",
        },
    };

    public context  : EnrollmentContext;  // a token of a user changing/enrolling the credential
    public onBusy   : () => void;
    public onUpdate : () => void;
    public onSuccess: (locals: {result?: Success}) => void;
    public onDelete : () => void;
    public onError  : (locals: {error?: Error }) => void;

    protected status: Success|Error|null;
    protected isEnrolled: boolean;

    constructor(
        public readonly credId: CredentialId,
        protected readonly $scope: ng.IScope,
    ){}

    protected get success() {
        return (this.status instanceof Success);
    }
    protected get error() {
        return (this.status instanceof Error);
    }
    protected resetStatus() {
        this.status = null;
    }
    protected async getEnrolled() {
        const user = this.context.getUser();
        try {
            const creds = (await this.context.enrollService.GetUserCredentials(user)).map(c => c.toUpperCase());
            return creds.includes(this.credId);
        } catch (e) {
            return false;
        }
    }

    // protected static getUser(token: JSONWebToken): User {
    //     const claims = JWT.claims(token);
    //     return  claims.sub && (claims.sub instanceof User) ? claims.sub :
    //             claims.wan ? new User(claims.wan) :
    //             claims.sub ? new User(claims.sub, UserNameType.DP) : User.Anonymous();
    // }
    protected emitOnBusy() {
        this.resetStatus();
        if (this.onBusy) this.onBusy();
//        this.$scope.$apply();
    }
    // protected emitOnUpdate() {
    //     this.resetStatus();
    //     if (this.onUpdate) this.onUpdate();
    // }
    protected emitOnSuccess(result: Success) {
        this.status = result;
        if (this.onSuccess) this.onSuccess({result});
    }
    protected emitOnError(error: Error) {
        this.status = error;
        if (this.onError) this.onError({error});
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
