import * as ng from 'angular';
import cookies from 'angular-cookies';
import route from 'angular-route';
import sanitize from 'angular-sanitize';
import translate from 'angular-translate';
import 'angular-translate-storage-local';
import 'angular-translate-storage-cookie';
import 'angular-translate-loader-static-files';

import './modules/WebSdk';

import './index.scss';

import localization from './config/localization'
import routes from './config/routes';
import app from './application/module'
import { AuthService, PolicyService } from '@digitalpersona/services';
import SupportedCredentials from './config/supportedCredentials';
import { IdentityService } from './application/services/identity';

ng.module("example", [
    route,
    cookies,
    sanitize,
    translate,
    'ngMessages',
    app,
])
.config(localization)
.config(routes)
.value("Domain", "websvr-12-64.alpha.local")
.factory("AppId", ["Domain", function(domain: string){
    return `https://${domain}/DPFido/app-id.json`
}])
.factory("AuthService", ["Domain", function(domain: string){
    return new AuthService(`https://${domain}/DPWebAUTH/DPWebAUTHService.svc`);
}])
.factory("PolicyService", ["Domain", function(domain: string){
    return new PolicyService(`https://${domain}/DPWebPolicies/DPWebPolicyService.svc`);
}])
.service("Identity", IdentityService)
.value("SupportedCredentials", SupportedCredentials)

ng.bootstrap(document, ["example"], {
    strictDi: true
});
