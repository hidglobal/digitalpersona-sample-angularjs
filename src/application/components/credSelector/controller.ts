import { User, JSONWebToken, JWT, ClaimName } from '@digitalpersona/core';
import { CredInfo } from '../../../config/credInfo';

export default class CredSelectorController
{
    public readonly identity: User|JSONWebToken;
    public readonly credentials: CredInfo[];
    public readonly onSelect: Function;
    public readonly selected: string;

    private tabs: CredInfo[];

    $onInit() {
        this.updateTabs();
    }
    $onChanges() {
        this.updateTabs();
    }

    select(cred: string) {
        if (this.onSelect) this.onSelect({selected: cred });
    }

    isAuthenticated(cred: CredInfo) {
        if (this.identity instanceof User)
            return false;
        const authenticated = JWT.claims(this.identity)[ClaimName.CredentialsUsed];
        if (!authenticated) return false;
        const ids = this.credentials.filter(c => c.name === cred.name).map(cred => cred.id);
        return authenticated.some(used => ids.includes(used.id.toUpperCase()));
    }

    updateTabs() {
        const uniqueName = (el: CredInfo, idx: number, arr: CredInfo[]) => arr.findIndex(item => item.name === el.name) === idx;
        this.tabs = this.credentials ? this.credentials.filter(uniqueName) : [];
    }
}
