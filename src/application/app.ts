import ng, { IComponentOptions } from 'angular';

import template from './app.html';

export default class AppControl
{
    public static readonly Component: IComponentOptions = {
        template,
        controller: AppControl,
    };

    public static $inject = ["$window", "$rootScope", "$translate"];
    constructor(
        private $window: ng.IWindowService,
        private $rootScope: ng.IScope,
        private $translate: ng.translate.ITranslateService,
    ){
        $rootScope["CompanyName"] = $translate.instant("CompanyName");
    }

    public onSignin() {}

    public onSignout() {
        this.$window.location.reload();
    }
}
