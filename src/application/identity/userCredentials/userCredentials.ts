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
    private credentials: CredInfo[];
    private enrolled: CredInfo[];
    private unenrolled: CredInfo[];
    private selected: string;
    private busy: boolean;

    public static $inject = ["EnrollService", "PolicyService", "$scope", "SupportedCredentials"];
    constructor(
        private enrollService: IEnrollService,
        private policyService: IPolicyService,
        private $scope: IScope,
        private supportedCredentials: { all: CredInfo[]},
    ){
    }

    public async $onInit() {
        await this.updateCredentials();
        this.busy = false;
        this.$scope.$apply();
    }

    private isEnrolled(cred: CredInfo) {
        return this.enrolled && this.enrolled.includes(cred);
    }
    public isSelected(name: string) {
        return this.selected && this.selected === name;
    }
    public isAllowed(name: string) {
        return this.getAllowedCredentials().includes(name);
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

    private async updateCredentials() {
        if (!this.policies)
            this.credentials = this.supportedCredentials.all;
        const allowed = this.getAllowedCredentials();
        this.credentials = this.supportedCredentials.all.filter(cred => allowed.includes(cred.id));
        this.enrolled = await this.getEnrolled();
        this.unenrolled = this.credentials.filter(c => !this.enrolled.includes(c));
        if (!this.selected || !this.credentials.some(cred => cred.name === this.selected))
            this.selected = this.credentials[0].name;
    }

    private getAllowedCredentials() {
        if (!this.policies)
            return this.supportedCredentials.all.map(cred => cred.id);
        const unique = (val: any, idx: number, arr: any[]) => arr.indexOf(val) === idx;
        return [].concat.apply([],
            this.policies.policyList
                .map(and => and.policy.map(or => or.cred_id)))
            .filter(unique);
    }
}
