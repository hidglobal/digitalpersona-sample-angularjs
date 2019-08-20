---
layout: default
title: Overview
has_toc: false
nav_order: 1  
---
{% include header.html %}  
<BR>

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

## Known issues and limitations

* The sample does not auto-refresh an authenticated user's token. Some operations require a fresh token,
  and they will start returning "Token possibly expired" error about 10 minutes after sign in.
  Users must refresh their tokens by signing out and then signign back in.

* Microsoft Edge 40 (EdgeHTML 15.15063) has an issue with CORS (Cross-Origin Request Security) 
  in XHR/Fetch requests, causing a "Fetch failed" or "Network request failed" error.
  See more details [here](https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/12339859/).

* IE11 requires following polyfills:
    * fetch
    * Object.assign
    * String.prototype.endsWith
    * Array.prototype.findIndex
    * Array.prototype.includes
    * Symbol
    * TextEncoder/TextDecoder

One of possible methods is to add a following script to your page:
```html
<script src="https://polyfill.io/v3/polyfill.min.js?features=Symbol%2Cfetch%2CString.prototype.endsWith%2CObject.assign%2CArray.prototype.findIndex%2CArray.prototype.includes"></script>
```

Also see [index.html]({{site.data.lib.git}}/{{site.data.lib.repo}}/src/index.html) for the `TextEncoder` polyfill.

* IE11 does not support WebRTC, so face recogintion in IE11 requires a polyfill for the `getUserMedia` API 
  which uses Adobe Flash as a fallback.

* IE11 does not support U2F.


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
