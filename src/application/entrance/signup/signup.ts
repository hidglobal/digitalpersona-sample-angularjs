import { IScope, ILocationService, IComponentOptions } from 'angular';
import { User, Ticket, UserNameType } from '@digitalpersona/core';
import { ServiceError, IEnrollService, IAuthService } from '@digitalpersona/services';

import template from './signup.html';
import { PasswordAuth } from '@digitalpersona/authentication';

export default class SignupControl
{
    public static readonly Component: IComponentOptions = {
        template,
        controller: SignupControl,
    };

    private username: string;
    private password: string;
    private error?: Error;
    private busy: boolean;

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
        delete this.error;
    }

    public updateUsername(value: string) {
        this.username = value;
    }

    public updatePassword(value: string) {
        this.password = value;
    }
    public updateRepeatPassword(value: string) {
        if (this.password !== value)
            this.showError(new Error('Signup.Error.PasswordMismatch'));
        else
            this.resetError();
    }

    public async submit() {
        try {
            this.busy = true;
            const customerAccountManagerToken = await new PasswordAuth(this.authService)
                .authenticate(new User("cam@alpha.local"), "aaaAAA123");
            await this.enrollService.CreateUser(
                new Ticket(customerAccountManagerToken),
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
