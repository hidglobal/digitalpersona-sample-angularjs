import { IComponentOptions, IScope } from 'angular';
import { IEnrollService, IPolicyService, PolicyInfo } from '@digitalpersona/services';

import template from './userCredentials.html';
import { CredInfo } from '../tokens/tokenAuth';
import { User, JSONWebToken } from '@digitalpersona/core';

export default class UserCredentialsControl
{
    public static readonly Component: IComponentOptions = {
        template,
        controller: UserCredentialsControl,
        bindings: {
            identity: '<',
            changeToken: '<',
        },
    };

    public identity: JSONWebToken;
    public changeToken: JSONWebToken;

    private policies: PolicyInfo | null;
    private enrolled: CredInfo[];
    private unenrolled: CredInfo[];
    private busy: boolean;

    public static $inject = ["EnrollService", "$scope", "SupportedCredentials"];
    constructor(
        private enrollService: IEnrollService,
        private $scope: IScope,
        private supportedCredentials: { all: CredInfo[]},
    ){
    }

    public async $onInit() {
        await this.updateCredentials();
        this.busy = false;
        this.$scope.$apply();
    }

    private async updateCredentials() {
        const uniqueName = (el: CredInfo, idx: number, arr: CredInfo[]) =>
            arr.findIndex(item => item.name === el.name) === idx;

        const allowed = this.getAllowedCredentials();
        const enrolled = await this.getEnrolled();
        this.enrolled = enrolled.filter(uniqueName);
        this.unenrolled = allowed.filter(c => !enrolled.includes(c)).filter(uniqueName);
    }

    private async getEnrolled() {
        const user = User.fromJWT(this.identity);
        try {
            const creds = (await this.enrollService.GetUserCredentials(user)).map(c => c.toUpperCase());
            return this.supportedCredentials.all.filter(c => creds.includes(c.id));
        } catch (e) {
            return [];
        }
    }

    private getAllowedCredentials(): CredInfo[] {
        if (!this.policies)
            return this.supportedCredentials.all;
        const unique = (val: any, idx: number, arr: any[]) => arr.indexOf(val) === idx;
        const ids = [].concat.apply([],
            this.policies.policyList
                .map(and => and.policy.map(or => or.cred_id)))
            .filter(unique);
        return this.supportedCredentials.all.filter(cred => ids.includes(cred.id));
    }
}
