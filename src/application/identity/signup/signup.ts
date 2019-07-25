import { IScope, ILocationService, IComponentOptions } from 'angular';
import { JSONWebToken } from '@digitalpersona/core';
import { ServiceError } from '@digitalpersona/services';

import template from './signup.html';
import UserService from '../user.service';

export default class SignupControl
{
    public static readonly Component: IComponentOptions = {
        template,
        controller: SignupControl,
    };

    public changeToken: JSONWebToken;

    private username: string;
    private password: string;
    private error?: Error;
    private busy: boolean;
    private isConsentGiven: boolean;
    private showPassword: boolean;

    public static $inject = ["UserApi", "$scope", "$location"];
    constructor(
        private userApi: UserService,
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
            await this.userApi.create(this.username, this.password);
            this.$location.url(`/signin?username=${this.username}`);
        }
        catch (e) {
            this.error = new Error(e.data);
        } finally {
            this.busy = false;
            this.$scope.$apply();
        }
    }

    public resetError() {
        delete this.error;
    }
}
