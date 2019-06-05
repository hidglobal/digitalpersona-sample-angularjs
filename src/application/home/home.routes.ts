import { IQService } from 'angular';
import { IdentityService } from '../identity';

routes.$inject = ["$routeProvider"];
export default function routes(
    $routeProvider: ng.route.IRouteProvider,
){
    // TODO: [periodically] check that the token satisfies current policies
    const authenticated = ["$q", "Identity", ($q:IQService , identityService: IdentityService) =>
        identityService.get() ? $q.resolve(identityService.get()) : $q.reject() ];

    // Map routes to components
    return $routeProvider
        .when('/', {
            template: "<x-home></x-home>",
        });
}
