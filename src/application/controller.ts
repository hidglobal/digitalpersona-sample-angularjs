import * as ng from 'angular'
import { IdentityService } from './services/identity';

export default class ExampleController
{
    static $inject = ["$window", "$rootScope", "$translate", "Identity"]
    constructor(
        private $window: ng.IWindowService,
        private $rootScope: ng.IScope,
        private $translate: ng.translate.ITranslateService,
        private identity: IdentityService
    ){
        $rootScope["CompanyName"] = $translate.instant("CompanyName");
    }

    public signout() {
        console.log('signout');
        // TODO: delete token
        this.identity.clear();
        this.$window.location.reload();
    }
}
