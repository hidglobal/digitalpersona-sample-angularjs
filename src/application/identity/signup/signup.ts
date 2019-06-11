import { IScope, ILocationService, IComponentOptions } from 'angular';
import { User, Ticket, UserNameType, JSONWebToken } from '@digitalpersona/core';
import { ServiceError, IEnrollService, IAuthService } from '@digitalpersona/services';

import template from './signup.html';
import { PasswordAuth } from '@digitalpersona/authentication';
import AuthorizationService from '../authorization.service';

export default class SignupControl
{
    public static readonly Component: IComponentOptions = {
        template,
        controller: SignupControl,
        bindings: {
            changeToken: '<',
        },
    };

    public changeToken: JSONWebToken;

    private username: string;
    private password: string;
    private error?: Error;
    private busy: boolean;
    private showPassword: boolean;

    public static $inject = ["EnrollService", "AuthService", "$scope", "$location"];
    constructor(
        private enrollService: IEnrollService,
        private authService: IAuthService,
        private $scope: IScope,
        private $location: ILocationService,
    ){
    }

    public $onInit() {
        this.busy = false;
        this.showPassword = false;
        delete this.error;
    }

    public updateUsername(value: string) {
        this.username = value;
        return this.validateUsername(value);
    }

    public updatePassword(value: string) {
        this.password = value;
        return this.validatePassword(value);
    }

    private validateUsername(value: string): string|void {
        if (/[ ]/.test(value)) return 'Username.Error.HasSpaces';
        if (/@.*?@/.test(value)) return 'Username.Error.InvalidFormat';
        if (/-{2}?/.test(value)) return 'Username.Error.ConsecutiveDashes';
        if (!/^[a-zA-Z0-9\.\_\@\-]*$/.test(value)) return 'Username.Error.InvalidCharacters';
}

    private validatePassword(value: string): string|void {
        if (value === this.username) return 'Password.Create.Error.SameAsUsername';
        if (/[ ]/.test(value)) return 'Password.Create.Error.HasSpaces';
        if (!/[A-Z]/.test(value)) return 'Password.Create.Error.NeedUpperCaseLetters';
        if (!/[a-z]/.test(value)) return 'Password.Create.Error.NeedLowerCaseLetters';
        if (!/\d/.test(value)) return 'Password.Create.Error.NeedDigits';
        if (!/[^a-zA-Z0-9:]/g.test(value)) return 'Password.Create.Error.NeedSpecialCharacters';
    }

    public async submit() {
        try {
            this.busy = true;
            // TODO: obtain the token on the server, take credentials from a config
            // const customerAccountManagerToken = await new PasswordAuth(this.authService)
            //     .authenticate(new User("cam@alpha.local"), "aaaAAA123");
            await this.enrollService.CreateUser(
                new Ticket(this.changeToken),
                new User(this.username, UserNameType.DP),
                this.password);
            this.$location.path('/signin');
        }
        catch (e) {
            this.showError(e);
            this.$scope.$apply();
        }
    }

    public resetError() {
        delete this.error;
    }

    public showError(error: ServiceError|Error) {
        this.busy = false;
        if (this.error === error) return;
        this.error = (error instanceof ServiceError)
            ? new Error(this.mapServiceError(error))
            : error;
    }

    private mapServiceError(e: ServiceError) {
        switch (e.code) {
            case -2147023580: return "Signup.Error.AlreadyExists";
            default: return e.message;
        }
    }
}
