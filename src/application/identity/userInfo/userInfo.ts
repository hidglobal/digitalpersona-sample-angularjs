import { IComponentOptions, IController } from 'angular';

import template from './userInfo.html';
import { JSONWebToken, Ticket, User, Url } from '@digitalpersona/core';
import { IEnrollService } from '@digitalpersona/services';

export default class UserInfoControl implements IController
{
    public static readonly Component: IComponentOptions = {
        template,
        controller: UserInfoControl,
        bindings: {
            identity: "<",
            changeToken: "<",
        },
    };

    public readonly identity: JSONWebToken;
    public readonly changeToken: JSONWebToken;

    public static $inject = ["EnrollService"];
    public constructor(
        private readonly enrollService: IEnrollService,
    ){}

    private userName() {
        const user = User.fromJWT(this.identity);
        return user.name;
    }

    private async deleteAccount() {
        try {
            // await this.enrollService.DeleteUser(new Ticket(this.changeToken), User.fromJWT(this.identity));
            const res = await fetch(Url.create('https://bank.alpha.local', 'user'), {
                method: 'DELETE',
                cache: "no-cache",
                mode: "cors",
                headers: {
                    "Content-Type": "application/json;charset=utf-8",
                    "Accept": "application/json",
                },
                body: JSON.stringify({
                    identity: this.identity,
                }),
            });
//          this.$location.path('/signin');
        }
        catch (e) {
//            this.showError(e);
//            this.$scope.$apply();
        }
    }
}
