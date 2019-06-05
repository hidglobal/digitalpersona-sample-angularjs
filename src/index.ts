import ng, { IRootScopeService } from 'angular';
import cookies from 'angular-cookies';
import route from 'angular-route';
import sanitize from 'angular-sanitize';

import translate from 'angular-translate';
import 'angular-translate-storage-local';
import 'angular-translate-storage-cookie';
import 'angular-translate-loader-static-files';

// import material from 'angular-material';
// import 'angular-messages';
// import 'angular-animate';
// import 'angular-aria';

// import 'popper.js';
// import 'bootstrap';

import './modules/WebSdk';

import './index.scss';

import localization from './config/localization';
import routes from './config/routes';
import app from './application/app.module';
import { AuthService, PolicyService, EnrollService } from '@digitalpersona/services';

ng.module("example", [
    route,
    cookies,
    sanitize,
    translate,
//    material,
    'ngMessages',
    app,
])
.config(localization)
.config(routes)

// Environment
.value("Domain", "websvr-12-64.alpha.local")
.factory("AppId", ["Domain", (domain: string) => {
    return `https://${domain}/DPFido/app-id.json`
}])

// DigitalPersona Web Management endpoints
.factory("AuthService", ["Domain", (domain: string) => {
    return new AuthService(`https://${domain}/DPWebAUTH/DPWebAUTHService.svc`);
}])
.factory("EnrollService", ["Domain", (domain: string) => {
    return new EnrollService(`https://${domain}/DPWebEnroll/DPWebEnrollService.svc`);
}])
.factory("PolicyService", ["Domain", (domain: string) => {
    return new PolicyService(`https://${domain}/DPWebPolicies/DPWebPolicyService.svc`);
}])
// .run(["$rootScope", ($rootScope: IRootScopeService) => {
//     $rootScope.$on('$routeChangeSuccess', function(event, current) {
//         $scope.currentLink = getCurrentLinkFromRoute(current);
//     });
// }]);

ng.bootstrap(document, ["example"], {
    strictDi: true,
});
