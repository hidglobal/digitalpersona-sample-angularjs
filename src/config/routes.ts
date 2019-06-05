routes.$inject = ["$routeProvider", "$locationProvider", "$provide"];
export default function routes(
    $routeProvider: ng.route.IRouteProvider,
    $locationProvider: ng.ILocationProvider,
    $provide: ng.auto.IProvideService,
){
    $provide.decorator("$sniffer", ["$delegate", ($delegate: any) => {
        $delegate.hsitory = false;
        return $delegate;
    }]),
    $locationProvider
        .html5Mode(true)
        .hashPrefix('!');
    // Map routes to components
    return $routeProvider
        // When in doubt -- first ask to logon.
        .otherwise("/");
}
