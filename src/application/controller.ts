import * as ng from 'angular'

export default class ExampleController
{
    static $inject = ["$window", "$rootScope", "$translate"]
    constructor(
        private $window: ng.IWindowService,
        private $rootScope: ng.IScope,
        private $translate: ng.translate.ITranslateService
    ){
        $rootScope["CompanyName"] = $translate.instant("CompanyName");
    }


    public signout() {
        console.log('signout');
        // TODO: delete token
        this.$window.location.reload();
    }
}
