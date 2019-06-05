import { IComponentOptions, IOnChangesObject, IChangesObject, IController } from 'angular';

import template from './userInfo.html';
import { JSONWebToken, JWT, ClaimName } from '@digitalpersona/core';

export default class UserInfoControl implements IController
{
    public identity: JSONWebToken;

    public static readonly Component: IComponentOptions = {
        template,
        controller: UserInfoControl,
        bindings: {
            identity: "<",
        },
    };

    // public $onChanges(changes: IOnChangesObject) {
    //     if (changes && changes.identity && changes.identity.isFirstChange)
    //         this.identity = changes.identity.currentValue;
    // }

    private userName() {
        const claims = JWT.claims(this.identity);
        return claims[ClaimName.WindowsAccountName] || claims[ClaimName.SubjectName] || "";
    }
}
