---
layout: default
title: Overview
has_toc: false
nav_order: 1  
---
{% include header.html %}  

# Overview

As a part of {{site.data.product.shortName}}, the {{ site.data.lib.name }} shows typical usage scenarios of the {{ site.data.product.name }}, such as:

* Creating and deleting user accounts.
* Enrolling and modifying user credentials, such as passwords, fingerprints, cards, facial, FIDO (U2F) tokens, One-Time Passwords and PINs.
* Multi-factor authentication (MFA) with enrolled credentials, driven by logon policies configured on the server.

This sample application uses a NodeJS backend and and AngularJS frontend, but {{ site.data.product.shortName }}
APIs are vanilla Typescript/Javascript libraries and will work with any JS framework.

## Instructions

* [Prerequisites](./prereqs.md)
* [Build the server](./build.md)
* [Configure the server](./configure.md)
* [Run the server](./run.md)


## License

The "Bank of DigitalPersona" sample application is licensed under the [MIT](./LICENSE) license.

Copyright (c) 2019 HID Global, Inc.

## Acknowledgements

The {{ site.data.lib.name }} uses the following third-party libraries:

### Business logic:

* Client-side facial recognition: [face-api.js](https://github.com/justadudewhohacks/face-api.js) by Vincent Mühler
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
