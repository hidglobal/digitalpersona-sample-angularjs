import { IComponentOptions, IController, IScope, ILocationService } from 'angular';

import { JSONWebToken, User } from '@digitalpersona/core';

import UserService from '../user.service';
import template from './userInfo.html';
import { IdentityService } from '..';

export default class UserInfoControl implements IController
{
    public static readonly Component: IComponentOptions = {
        template,
        controller: UserInfoControl,
        bindings: {
            identity: "<",
        },
    };

    public readonly identity: JSONWebToken;

    private busy: boolean = false;
    private error?: Error;

    public static $inject = ["UserApi", "Identity", "$scope", "$location"];
    public constructor(
        private readonly userApi: UserService,
        private readonly identityService: IdentityService,
        private readonly $scope: IScope,
        private readonly $location: ILocationService,
    ){}

    private userName() {
        const user = User.fromJWT(this.identity);
        return user.name;
    }

    public async deleteAccount() {
        this.busy = true;
        try {
            await this.userApi.delete(this.identity);
            this.identityService.clear();
            this.$location.path('/');
        }
        catch (e) {
//            this.showError(e);
        } finally {
            this.busy = false;
            this.$scope.$apply();
        }
    }

    public resetError() {
        delete this.error;
    }

    public showError(error: Error) {
        this.busy = false;
        this.error = error;
    }

}
