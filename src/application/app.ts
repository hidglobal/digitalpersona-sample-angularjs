import ng, { IComponentOptions, ILocationService } from 'angular';

import template from './app.html';

export default class AppControl
{
    public static readonly Component: IComponentOptions = {
        template,
        controller: AppControl,
    };

    public static $inject = ["$location", "$rootScope", "$translate"];
    constructor(
        private $location: ILocationService,
        private $rootScope: ng.IScope,
        private $translate: ng.translate.ITranslateService,
    ){
        $rootScope["CompanyName"] = $translate.instant("CompanyName");
    }

    public onSignin() {}

    public onSignout() {
        this.$location.url("/");
        this.$rootScope.$apply();
    }
}
