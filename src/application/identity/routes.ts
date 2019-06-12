import { IQService } from 'angular';
import IdentityService from './identity.service';
import AuthorizationService from './authorization.service';

routes.$inject = ["$routeProvider"];
export default function routes(
    $routeProvider: ng.route.IRouteProvider,
){
    const anonymous = ["$q", "Identity", ($q: IQService, identityService: IdentityService) =>
        identityService.get() ? $q.reject() : $q.resolve() ];
    // TODO: [periodically] check that the token satisfies current policies
    const identity = ["$q", "Identity", ($q: IQService, identityService: IdentityService) =>
        identityService.get() ? $q.resolve(identityService.get()) : $q.reject() ];
    const changeToken = ["$q", "Authorizer", ($q: IQService, az: AuthorizationService) =>
        $q.when(az.getChangeToken()) ];

    const activityView = (name: string, component: string) =>
    `<x-activity-view title="'${name}.Create.Title' | translate">
        <${component}
            identity="$resolve.identity"
            change-token="$resolve.changeToken"
        ></${component}>
    </x-activity-view>`;

    // Map routes to components
    return $routeProvider
        // Entrance routes for all unauthenticated users
        .when('/signin', {
            template: "<x-signin></x-signin>",
            resolve: { anonymous },
        })
        .when('/signup', {
            template: "<x-signup change-token='$resolve.changeToken'></x-signup>",
            resolve: { anonymous, changeToken },
        })
        .when('/signup/confirm-email', {
            template: "<x-confirm-email></x-confirm-email>",
            resolve: { anonymous },
        })
        .when('/restore', {
            template: "<x-restore></x-restore>",
            resolve: { anonymous },
        })
        .when('/restore/questions', {
            template: "<x-restore-questions></x-restore-questions>",
            resolve: { anonymous },
        })
        .when('/restore/otp', {
            template: "<x-restore-otp></x-restore-otp>",
            resolve: { anonymous },
        })
        .when('/restore/reset-password', {
            template: "<x-reset-password></x-reset-password>",
            resolve: { anonymous },
        })

        // Home routes for authenticated users
        .when('/user', {
            template:   `<x-user-info
                            identity="$resolve.identity"
                            change-token="$resolve.changeToken"
                        ></x-user-info>`,
            resolve: { identity, changeToken },
        })

        // credential enrollment/change pages
        .when('/user/change/Password', {
            template: activityView('Password', 'x-password-change'),
            resolve: { identity, changeToken },
        })
        .when('/user/change/PIN', {
            template: activityView('PIN', 'x-pin-change'),
            resolve: { identity, changeToken, $window: "$window" },
        })
        .when('/user/change/Fingerprints', {
            template: activityView('Fingerprints', 'x-fingerprints-change'),
            resolve: { identity, changeToken, $window: "$window" },
        })
        .when('/user/change/Face', {
            template: activityView('Face', 'x-face-change'),
            resolve: { identity, changeToken, $window: "$window" },
        })
        .when('/user/change/U2F', {
            template: activityView('U2F', 'x-fido-change'),
            resolve: { identity, changeToken, $window: "$window" },
        })
        .when('/user/change/Cards', {
            template: activityView('Cards', 'x-cards-change'),
            resolve: { identity, changeToken, $window: "$window" },
        })

}
