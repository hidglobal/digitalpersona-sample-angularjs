import { IComponentOptions } from 'angular';
import { User, JSONWebToken, JWT, ClaimName } from '@digitalpersona/core';
import 'font-awesome/scss/font-awesome.scss';

import { CredInfo } from '../../../config/credInfo';
import template from './credSelector.html';

export default class CredSelectorControl
{
    public static readonly Component: IComponentOptions = {
        template,
        controller: CredSelectorControl,
        bindings: {
            identity: '<',
            credentials: '<',
            selected: '<',
            onSelect: '&',
        },
    };

    public readonly identity: User|JSONWebToken;
    public readonly credentials: CredInfo[];
    public readonly onSelect: (locals: { selected: string }) => void;
    public readonly selected: string;

    private tabs: CredInfo[];

    public $onInit() {
        this.updateTabs();
    }
    public $onChanges() {
        this.updateTabs();
    }

    public select(cred: string) {
        if (this.onSelect) this.onSelect({selected: cred });
    }

    public isAuthenticated(cred: CredInfo) {
        if (this.identity instanceof User)
            return false;
        const authenticated = JWT.claims(this.identity)[ClaimName.CredentialsUsed];
        if (!authenticated) return false;
        const ids = this.credentials.filter(c => c.name === cred.name).map(_ => _.id);
        return authenticated.some(used => ids.includes(used.id.toUpperCase()));
    }

    public updateTabs() {
        const uniqueName = (el: CredInfo, idx: number, arr: CredInfo[]) =>
            arr.findIndex(item => item.name === el.name) === idx;
        this.tabs = this.credentials ? this.credentials.filter(uniqueName) : [];
    }
}
