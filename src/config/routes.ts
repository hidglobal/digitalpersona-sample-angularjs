import '../application'
import '../application/home'
import '../application/entrance/signin'

routes.$inject = ["$routeProvider", "$locationProvider"]
export default function routes(
    $routeProvider: ng.route.IRouteProvider,
    $locationProvider: ng.ILocationProvider,
){
    $locationProvider.html5Mode(true);

    // Map routes to components
    return $routeProvider
        .when('/', {
//            template: "<x-home></x-home>"
            template: "<x-signin></x-signin>"
        })

        // Entrance routes for all unauthenticated users
        .when('/signin', {
            template: "<x-signin></x-signin>"
        })
        .when('/signout', {
            template: "<x-signout></x-signout>"
        })
        .when('/signup', {
            template: "<x-signup></x-signup>"
        })
        .when('/signup/confirm-email', {
            template: "<x-confirm-email></x-confirm-email>"
        })
        .when('/restore', {
            template: "<x-restore></x-restore>"
        })
        .when('/restore/questions', {
            template: "<x-restore-questions></x-restore-questions>"
        })
        .when('/restore/otp', {
            template: "<x-restore-otp></x-restore-otp>"
        })
        .when('/restore/reset-password', {
            template: "<x-reset-password></x-reset-password>"
        })

        // Home routes for authenticated users
        .when('/main', {
            template: "<x-main></x-main>"
        })

        // When in doubt -- first ask to logon.
        .otherwise("/");
}
