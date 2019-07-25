import { IComponentOptions, IController, IScope, ILocationService } from 'angular';
import { JSONWebToken, User } from '@digitalpersona/core';
import { StatusAlert } from '../../common';
import UserService from '../user.service';
import { IdentityService } from '..';

import template from './profile.html';

interface Tab {
    id: string;
}

export default class UserProfileControl implements IController
{
    public static readonly Component: IComponentOptions = {
        template,
        controller: UserProfileControl,
        bindings: {
            identity: "<",
        },
    };

    public readonly identity: JSONWebToken;

    private tabs = [
        { id: "Info" },
        { id: "Security" },
    ];
    private selected: Tab;
    private busy: boolean = false;
    private status?: StatusAlert;

    public static $inject = ["UserApi", "Identity", "$scope", "$location"];
    public constructor(
        private readonly userApi: UserService,
        private readonly identityService: IdentityService,
        private readonly $scope: IScope,
        private readonly $location: ILocationService,
    ){}

    public $onInit() {
        this.select(this.tabs[0]);
    }

    private select(tab: Tab) {
        this.selected = tab;
    }

    public async deleteAccount() {
        this.notify();
        this.busy = true;
        try {
            await this.userApi.delete(this.identity);
            this.identityService.clear();
            this.$location.path('/');
            this.notify();
        }
        catch (e) {
            this.notify();  // show an error here?
        } finally {
            this.$scope.$apply();
        }
    }

    public notify(status?: StatusAlert) {
        this.busy = false;
        this.status = status;
    }

}
