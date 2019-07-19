import ng, { IHttpService } from 'angular';
import cookies from 'angular-cookies';
import route from 'angular-route';
import sanitize from 'angular-sanitize';

import translate from 'angular-translate';
import 'angular-translate-storage-local';
import 'angular-translate-storage-cookie';
import 'angular-translate-loader-static-files';

import './modules/WebSdk';

import './index.scss';

import localization from './config/localization';
import routes from './config/routes';
import app from './application/app.module';
import { AuthService, PolicyService, EnrollService } from '@digitalpersona/services';

interface ServerSettings
{
    endpoints: {
        auth: string,
        enroll: string,
        policies: string,
        u2fAppId: string,
    };
}

const module = ng.module("example", [
    route,
    cookies,
    sanitize,
    translate,
    'ngMessages',
    app,
])
.config(localization)
.config(routes);

// The trick below allows us to lazily register services configured with runtime configuration data.
// First we save a reference to the $provide service which is usually available only
// on a AngularJS bootstrapping phase.
// At the run phase we ask our server for configuration data (e.g. service endpoints),
// then we configure our services with the data and dynamically register them in AngularJS DI.
// This way we do not need to inject our configuration data into a page content, but
// provide it using an api request.

let provide: ng.auto.IProvideService;

module.config(["$provide", ($provide: ng.auto.IProvideService) => {
    provide = $provide;
}])
.run(["$http", (
        $http: IHttpService,
    ) => {
        // request server configuration data
        $http.get("api/settings").then(res => {
            const { endpoints } = res.data as ServerSettings;
            // configure our services and register them in DI
            provide.constant("AppId", endpoints.u2fAppId);
            provide.constant("AuthService", new AuthService(endpoints.auth));
            provide.constant("EnrollService", new EnrollService(endpoints.enroll));
            provide.constant("PolicyService", new PolicyService(endpoints.policies));
        });
}]);

ng.bootstrap(document, ["example"], {
    strictDi: true,
});
