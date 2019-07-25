import { IScope, ILocationService, IComponentOptions } from 'angular';
import { JSONWebToken, UserNameType, User, Ticket } from '@digitalpersona/core';
import { ServiceError, IAuthService, IEnrollService, AttributeAction, Attribute, AttributeType } from '@digitalpersona/services';

import template from './signup.html';
import UserService from '../user.service';
import { StatusAlert } from '../tokens/tokenAuth';
import { PasswordAuth } from '@digitalpersona/authentication';

export default class SignupControl
{
    public static readonly Component: IComponentOptions = {
        template,
        controller: SignupControl,
    };

    public changeToken: JSONWebToken;

    private username: string;
    private password: string;
    private showPassword: boolean;
    private displayName: string;
    private email: string;

    private status?: StatusAlert;
    private busy: boolean;
    private isConsentGiven: boolean;

    public static $inject = ["UserApi", "AuthService", "EnrollService", "$scope", "$location"];
    constructor(
        private userApi: UserService,
        private authService: IAuthService,
        private enrollService: IEnrollService,
        private $scope: IScope,
        private $location: ILocationService,
    ){
    }

    public $onInit() {
        this.busy = false;
        this.showPassword = false;
    }

    public updateUsername(value: string) {
        this.notify();
        this.username = value;
        return this.validateUsername(value);
    }

    public updatePassword(value: string) {
        this.notify();
        this.password = value;
        return this.validatePassword(value);
    }

    public updateDisplayName(value: string) {
        this.displayName = value;
    }
    public updateEmail(value: string) {
        this.email = value;
    }

    private validateUsername(value: string): string|void {
        if (/[ ]/.test(value)) return 'Username.Error.HasSpaces';
        if (/@.*?@/.test(value)) return 'Username.Error.InvalidFormat';
        if (/-{2}?/.test(value)) return 'Username.Error.ConsecutiveDashes';
        if (!/^[a-zA-Z0-9:\.\_\@\-]*$/.test(value)) return 'Username.Error.InvalidCharacters';
}

    private validatePassword(value: string): string|void {
        if (value === this.username) return 'Password.Create.Error.SameAsUsername';
        if (/[ ]/.test(value)) return 'Password.Create.Error.HasSpaces';
        if (!/[A-Z]/.test(value)) return 'Password.Create.Error.NeedUpperCaseLetters';
        if (!/[a-z]/.test(value)) return 'Password.Create.Error.NeedLowerCaseLetters';
        if (!/\d/.test(value)) return 'Password.Create.Error.NeedDigits';
        if (!/[^a-zA-Z0-9]/g.test(value)) return 'Password.Create.Error.NeedSpecialCharacters';
    }

    public async submit() {
        try {
            this.busy = true;
            // create a new user account
            await this.userApi.create(this.username, this.password);
        } catch (e) {
            this.notify(new Error(e.data));
        } finally {
            this.busy = false;
            this.$scope.$apply();
        }
        try {
            // try to login temporary, to modify personal data
            const auth = new PasswordAuth(this.authService);
            const user = new User(this.username, UserNameType.DP);
            const token = await auth.authenticate(user, this.password);
            const ticket = new Ticket(token);
            // update personal data
            if (this.displayName) {
                await this.enrollService.PutUserAttribute(ticket
                    , user
                    , "displayName"
                    , AttributeAction.Update
                    , new Attribute(AttributeType.String, [this.displayName]));
            }
            if (this.email) {
                await this.enrollService.PutUserAttribute(ticket
                    , user
                    , "mail"
                    , AttributeAction.Update
                    , new Attribute(AttributeType.String, [this.email]));
            }
            // redirect to the signin page for a first logon
            this.$location.url(`/signin?username=${this.username}`);
        }
        catch (e) {
            this.notify(new Error(this.mapServiceError(e)));
        } finally {
            this.busy = false;
            this.$scope.$apply();
        }
    }

    private mapServiceError(error: ServiceError) {
        switch (error.code) {
            default: return error.message;
        }
    }
    private notify(status?: StatusAlert) {
        this.busy = false;
        this.status = status;
    }
}
