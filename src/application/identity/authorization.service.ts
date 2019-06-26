import { IAuthService, IPolicyService } from '@digitalpersona/services';
import { User, JSONWebToken, JWT } from '@digitalpersona/core';
import { PasswordAuth } from '@digitalpersona/authentication';

import { IQService } from 'angular';

export default class AuthorizationService
{
     // if a token expires in less than 1 minutes, refresh it
    private static readonly TOKEN_EXPIRATION_WINDOW = 60;
    private static readonly SECURITY_OFFICER_ACCOUNT = new User("cam@alpha.local");
    private static readonly SECIRUTY_OFFICER_CREDENTIAL = "aaaAAA123";

    private changeToken: JSONWebToken;

    public static $inject = ["$q", "AuthService", "PolicyService" ];
    constructor(
        private readonly $q: IQService,
        private readonly authService: IAuthService,
        private readonly policyService: IPolicyService,
    ){

    }

    public async getChangeToken() {
        return null;
        if (!this.isTokenValid(this.changeToken)) {
            this.changeToken = await new PasswordAuth(this.authService).authenticate(
                AuthorizationService.SECURITY_OFFICER_ACCOUNT,
                AuthorizationService.SECIRUTY_OFFICER_CREDENTIAL);
        }
        return this.changeToken;
    }

    private isTokenValid(token: JSONWebToken|null): boolean {
        if (!token) return false;
        const exp = JWT.claims(this.changeToken).exp;
        if (!exp) return false;
        return exp > (new Date().getTime() / 1000 + AuthorizationService.TOKEN_EXPIRATION_WINDOW);
    }

}
