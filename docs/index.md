---
layout: default
title: Overview
has_toc: false
nav_order: 1  
---
{% include header.html %}  
<BR>

# Overview

As a part of {{site.data.product.shortName}}, the {{ site.data.lib.name }} shows typical usage scenarios of {{ site.data.product.name }} APIs:

* creating and deleting a user account.
* enrolling and changing user credentials, such as password, fingerprints, cards, face, U2F tokens,
one-time password, PIN.
* multi-factor authentication (MFA) with enrolled credentials, driven by logon policies configured 
on the server.

The sample application uses NodeJS backend and AngularJS frontend, but {{ site.data.product.shortName }} 
APIs are vanilla Typescript/Javascript libraries and will work with any JS framework.

## Build and Run

1. Install Node JS (use the [download link](https://nodejs.org))

2. Install a `supervisor` NPM package globally:
```
npm install supervisor -g
```

3. Clone the sample repository:
```
git clone {{site.data.lib.git}}/{{site.data.lib.repo}}.git
```

4. Install dependencies:
```
cd {{site.data.lib.repo}}
npm install
```

5. Build the site:

Production:
```
npm run build-prod
```

Development: 
```
npm run build-dev
```

6. Configure the server (see [instructions below](#configure)).

7. Start the server:
```
npm run server
```

8. Open a main page in a browser.

<a name="configure"></a>
## Configuration

### Prerequisites

The sample requires following products to be installed and configured:

* Windows ADAM Service (LDS)
* DigitalPersona LDS Server (DP LDS Server)
* DigitalPersona LDS Administration Tools (DP LDS AT)
* DigitalPersona LDS Web Management Components (DP LDS WMC)

DigitalPersona LDS Server comes with an evaluation license allowing
enrollment of up to 10 users during first 30 days. If you want more
users or longer enrollment period, obtain and apply a DigitalPersona Server license.

To use Face credentials, an Innovatrics Face Engine license must be obtained and applied.

To use SMS OTP, a Nexmo SMS gateway account must be obtained and configured.

To use Push Notifications OTP, a Push Notification API key and Tenant ID must be obtained and configured.

To use Email verification and OTP sending, a SMTP server must be configured.


### Server Identity

To let customers register new accounts, create a dedicated `security officer` Windows account, 
and assign it a role of `Security Officer` using the AzMan console.
Then add the account name and password to the sample configuration file `/server/config.js` in the
`serviceIdentity` section:

./server/config.js:
---
```
module.exports = {
    site: {
        serviceIdentity: {
            username: "account-manager@contoso.com",
            password: "pa$$w0rd"
        },
        ...
    },
    ...
}
```

### Self-enrollemnt 

To let customers to enroll new credentials, add an `Enroll Self` task definition to the 
`DigitalPersona User` role using the AzMan console.

### Domain Name

Make sure your sample server machine has a DNS record.

### SSL/TLS Certificate

Your sample server must use HTTPS, so make sure you have issued a valid SSL/TLS certificate. 
The certificate must match the sample server DNS name.

**The certificate must be signed by a Certificate Authority which is trusted
both by your sample server machine and by your client's machines.** Avoid using self-signed
certificates!

If you use a private CA (e.g. your ActiveDirectory CA), make sure all participants (server and clients)
are either joined the AD domain or have the public key of the Root CA certificate manually imported 
into their `Trusted Roots` stores.

Import a private key of your SSL/TLS certificate into a password-protected PFX file, 
copy the file into the `./certificates` folder of the sample and make sure the sample server config 
has the path and password to the PFX file configured:

./server/config.js:
---
```
module.exports = {
    site: {
        host: 'sample.company.com',
        port: 443,
        sslCertificate: {
            pfxFilename: 'certificates/ssl.pfx',
            passphrase: 'test'
        },
        ...
    },
}
```

### Service Endpoints

Add DigitalPersona LDS Web Management Components endpoints to the sample server configuration,
in the `endpoints` section:

./server/config.js:
---
```
const dpWebAccessManagementServer = 'dpam.company.com'

module.exports = {
    ...
    endpoints: {
        auth: `https://${dpWebAccessManagementServer}/DPWebAUTH/DPWebAUTHService.svc`,
        enroll: `https://${dpWebAccessManagementServer}/DPWebEnroll/DPWebEnrollService.svc`,
        policies: `https://${dpWebAccessManagementServer}/DPWebPolicies/DPWebPolicyService.svc`,
        u2fAppId: `https://${dpWebAccessManagementServer}/DPFido/app-id.json`
    }
}
```

Note that in most cases all you need is just set the `dpWebAccessManagementServer` value to the
DP LDS WMC domain and let all the service endpoint URLs to be calculated.


## License

The "Bank of DigitalPersona" sample application is licensed under the [MIT](./LICENSE) license. 

Copyright (c) 2019 HID Global, Inc.

## Acknowledgements

The {{ site.data.lib.name }} uses following third-party libraries:

### Business logic:

* Client-side facial recognition: [face-api.js](https://github.com/justadudewhohacks/face-api.js) by Vincent M�hler
* QR Code generator for OTP: [qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator) by Kazuhiko Arase

### Server infrastructure:

* Web server: [NodeJS](https://nodejs.org) by Joyent
* A `fetch` shim for NodeJS: [node-fetch](https://github.com/bitinn/node-fetch) by David Frank
* A base64 encoding for NodeJS: [base-64](https://github.com/mathiasbynens/base64) by Mathias Bynens
* Windows Certificate Store access for NodeJS: [win-ca](https://github.com/ukoloff/win-ca) by Stas Ukolov

### Frontend infrastructure:

* Web UI framework: [AngularJS 1.7](https://angularjs.org/) by Google
* Localization framework: [angular-translate](https://angular-translate.github.io/) by Pascal Precht
* Styles: [Bootstrap 3.3](https://getbootstrap.com/docs/3.3/) by Twitter
* UI Components: [angular-ui-bootstrap]() by AngularUI Team

### Development tools

* Main language: [Typescript](https://www.typescriptlang.org/) by Microsoft
* Javascript bundling: [Webpack](https://github.com/webpack/webpack) by Tobias Koppers, JS Foundation and other contributors
