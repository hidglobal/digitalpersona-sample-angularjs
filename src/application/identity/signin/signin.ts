import { IScope, ILocationService, IComponentOptions } from 'angular';
import { JSONWebToken, User, JWT, ClaimName, UserNameType, CredentialId } from '@digitalpersona/core';
import { ServiceError, IPolicyService, ResourceActions, ContextualInfo, PolicyInfo, Policy, IAuthService } from '@digitalpersona/services';
import { CardsReader, FingerprintReader, SampleFormat } from '@digitalpersona/devices';

import { CredInfo } from '../tokens/configuration/credInfo';
import { IdentityService } from '../../identity';
import template from './signin.html';
import { StatusAlert, Warning } from '../../common';

export default class SigninControl
{
    public static readonly Component: IComponentOptions = {
        template,
        controller: SigninControl,
    };

    private identity: User|JSONWebToken;
    private busy: boolean = false;
    private selected: string;
    private credentials: CredInfo[];
    private enrolledCredentials?: CredentialId[];
    private policies?: PolicyInfo;
    private error?: Error;

    private fingerprintReader: FingerprintReader;
    private cardReader: CardsReader;

    public static $inject = ["AuthService", "PolicyService", "$scope", "$location", "$route", "SupportedCredentials", "Identity"];
    constructor(
        private authService: IAuthService,
        private policyService: IPolicyService,
        private $scope: IScope,
        private $location: ILocationService,
        private $route: ng.route.IRouteService,
        private supportedCredentials: { all: CredInfo[]},
        private identityService: IdentityService,
    ){
    }

    public async $onInit() {
        this.identity = User.Anonymous();
        this.fingerprintReader = new FingerprintReader();
        this.cardReader = new CardsReader();

        try {
            await this.fingerprintReader.startAcquisition(SampleFormat.Intermediate);
            this.update();
        } catch (err) {
            this.updateStatus('Fingerprints', new Warning(err.message));
        }

        try {
            await this.cardReader.subscribe();
            this.update();
        } catch (err) {
            this.updateStatus('Cards', new Warning(err.message));
        }

        this.updateCredentials();
        if (this.$route.current) {
            const { username } = this.$route.current.params;
            await this.updateIdentity(new User(username, UserNameType.DP));
        } else
            await this.updateIdentity(User.Anonymous());
        this.busy = false;
        delete this.error;
    }

    public $onDestroy() {
        this.fingerprintReader.stopAcquisition();
        this.fingerprintReader.off();
        delete this.fingerprintReader;

        this.cardReader.unsubscribe();
        this.cardReader.off();
        delete this.cardReader;
    }

    private updateCredentials() {
        if (!this.policies)
            this.credentials = this.supportedCredentials.all;
        const allowed = this.getAllowedCredentials();
        this.credentials = this.supportedCredentials.all
            .filter(cred => allowed.includes(cred.id));
        if (this.enrolledCredentials) {
            const enrolled = this.enrolledCredentials;
            this.credentials = this.credentials.filter(cred => enrolled.includes(cred.id));
        }
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

    // TODO: should be a Policies' method
    // TODO: if the user is has enrolled only a password but policy requires multi-factor,
    // let the user in but redirect them to the credential enrollment page.
    // This way fresh users with a password only will have a chance to comply.
    public isEnoughCredentials() {
        if (!this.identity) return false;
        if (this.identity instanceof User)
            return false;
        const authenticated = JWT.claims(this.identity)[ClaimName.CredentialsUsed];
        if (!authenticated || authenticated.length === 0)
            return false;
        if (!this.policies)
            return true;        // any credential is enough
        const ids = authenticated.map(cred => cred.id);
        const satisfied = this.policies.policyList.some(rule =>
            rule.policy.every(el => ids.includes(el.cred_id.toUpperCase())),
        );
        return satisfied;
    }

    public get isIdentified() {
        return !(this.identity instanceof User);
    }

    public isSelected(name: string) {
        return this.selected && this.selected === name;
    }
    public isAllowed(name: string) {
        return this.getAllowedCredentials().includes(name);
    }
    public isAuthenticated(cred: CredInfo) {
        if (this.identity instanceof User)
            return false;
        const authenticated = JWT.claims(this.identity)[ClaimName.CredentialsUsed];
        return authenticated && authenticated.findIndex((used => used.id.toUpperCase() === cred.id)) >= 0;
    }

    public updateUsername(value: string) {
        this.updateIdentity(new User(value));
    }

    public show(selected: string) {
        console.log(`Showing '${selected}'`);
        this.selected = selected;
        console.log(this.selected);
    }

    public getUser(): User {
        return (this.identity instanceof User)
            ? this.identity
            : User.fromJWT(this.identity);
    }

    public setBusy() {
        this.busy = true;
        delete this.error;
    }

    public update() {
        this.$scope.$apply();
    }

    public async updateIdentity(identity: User| JSONWebToken) {
        if (this.policies && (this.identity === identity)) return;
        this.identity = identity;
        this.update();
        try {
            const user = this.getUser();
            this.policies = await this.policyService
                .GetPolicyInfo(user, "*", ResourceActions.Write, new ContextualInfo());
            // if (!user.isAnonymous() && !user.isEveryone())
            //     this.enrolledCredentials = await this.authService.GetUserCredentials(user);
            // else
            //     delete this.enrolledCredentials;
            this.updateCredentials();
        } catch (e) {
            console.log(e);
        }
        if (this.isEnoughCredentials()) {
            this.identityService.set(this.identity as JSONWebToken);
            this.$location.url("/");
        }
        this.busy = false;
        this.$scope.$apply();
    }

    public async updateToken(token: JSONWebToken) {
        if (this.identity === token) return;
        if (this.isIdentified) {
            // TODO: if we've already identified the user,  make sure it is the same user again
        }
        await this.updateIdentity(token);
        this.selectNext();
        this.$scope.$apply();
    }

    // selects next best credential among not entered yet
    private selectNext() {
        if (this.identity instanceof User) return;
        if (!this.policies) return;
        const authenticated = JWT.claims(this.identity)[ClaimName.CredentialsUsed];
        if (!authenticated) return;
        const ids = authenticated.map(cred => cred.id);

        const score = (rule: Policy) => this.supportedCredentials.all
            .filter(cred => rule.policy.map(p => p.cred_id).includes(cred.id))
            .reduce((prev, curr) => prev * curr.strength, 1);

        const bestPolicyRules = this.policies.policyList
            .sort((a, b) => score(b) - score(a))
            .map(rule => rule.policy
                .map(cred => cred.cred_id)
                .filter(id => !ids.includes(id))) // create a reduced set of ids
            .filter(rule => rule.length > 0)
            .sort((a, b) => a.length - b.length);
        if (bestPolicyRules.length > 0) {
            const id = bestPolicyRules[0][0];
            const cred = this.supportedCredentials.all.find(c => c.id === id);
            if (cred)
                this.show(cred.name);
        }
    }

    public updateStatus(cred: string, status?: StatusAlert) {
        this.busy = false;
        if (status instanceof Error) {
            this.error = status;
            this.selected = cred;
        } else
            delete this.error;
        // if (error instanceof ServiceError) {
        //     if (error.code === -2146893033) {  // Authentication context expired, drop the token and replace with a user
        //         this.updateIdentity(this.getUser());
        //     }
        // }
    }

    public showError(error: ServiceError|Error, cred: string) {
        this.busy = false;
        if (this.error === error) return;
        if (error) {
            this.error = error;
            this.selected = cred;
        } else
            delete this.error;
        if (error instanceof ServiceError) {
            if (error.code === -2146893033) {  // Authentication context expired, drop the token and replace with a user
                this.updateIdentity(this.getUser());
            }
        }
        this.update();
    }
}
