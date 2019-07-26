---
layout: default
title: Configuration
has_toc: false
nav_order: 3
---
{% include header.html %}  

# Configuration

## Service identity

DigitalPersona Server does not allow regular users to create or delete their own accounts.
Only an authorized account having the `Create Customer` permission can create and delete 
DigitalPersona User accounts. The demo NodeJS server must be able to work on behalf
of such authorized account.

* On the DigitalPersona Server: 
   * create a dedicated Windows account which will be used as a customer account manager
   * add this account to the `Security Officer` role using the AzMan console.
   * for the `Security Officer` role, add the `Create Customers` task authorization.

* On the demo server:
   * add the account name and password to the sample configuration file `/server/config.js`
     in the `serviceIdentity` section:

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

## Self-enrollment 

To let users to enroll new credentials:

* On the DigitalPersona Server: 
  * add an `Enroll Self` task authorization to the `DigitalPersona User` role using the AzMan console.

## Host name and port

Make sure that your web hosting machine:

* has a DNS record for the host name
* has opened an inbound port (443 for HTTPS)
* has opened outound port to DP Web Services (443 for HTTPS)

Configure the server:

./server/config.js:
---
```js
module.exports = {
    site: {
        host: 'sample.company.com',
        port: 443,
        ...
    },
}
```

To use U2F (FIDO), add the application host name into the `app-id.json` configuration of DP Web Components:

```json
{
  "trustedFacets": [
    {
      "version": {
        "major": 1,
        "minor": 0
      },
      "ids": [
        "https://sample.company.com"
      ]
    }
  ]
}
```

## SSL/TLS Certificate

The sample server must use HTTPS, so make sure you have a valid SSL/TLS certificate 
matching the sample server DNS name.

**The certificate must be signed by a Certificate Authority which is trusted
both by your sample server machine and by your client's machines.**
Avoid using self-signed certificates!

>If you use a private CA (e.g. your ActiveDirectory CA), make sure all participants
(server and clients) are either joined the AD domain or have the public key of the Root CA
certificate manually imported into their `Trusted Roots` stores.

Import a private key of your SSL/TLS certificate into a password-protected PFX file, 
copy the file into the `./certificates` folder of the sample and make sure the sample server config 
has the path and password to the PFX file configured:

./server/config.js:
---
```js
module.exports = {
    site: {
        ...
        sslCertificate: {
            pfxFilename: 'certificates/ssl.pfx',
            passphrase: 'test'
        },
        ...
    },
}
```

## Service Endpoints

Add DigitalPersona LDS Web Management Components endpoints to the sample server configuration,
in the `endpoints` section:

./server/config.js:
---
```js
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

## Hardening security

We recommend to protect the `./server` directory from unauthorized access. 
It is especially important to protect the `./server/config.js` file from unauthorized read
because it contains very sensitive data.

---
Next: [Run the server](./run)
