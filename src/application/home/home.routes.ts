
routes.$inject = ["$routeProvider"];
export default function routes(
    $routeProvider: ng.route.IRouteProvider,
){
    // Map routes to components
    return $routeProvider
        .when('/', {
            template: '<x-home></x-home>',
        });
}
