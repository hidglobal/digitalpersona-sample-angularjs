# Bank of DigitalPersona sample

This is a sample web site demonstrating usage of different DigitalPersona Web Access Management APIs.

## Prerequisites

The sample requires following products to be installed and configured:

* Windows ADAM Service (LDS)
* DigitalPersona LDS Server (DP LDS Server)
* DigitalPersona LDS Administration Tools (DP LDS AT)
* DigitalPersona LDS Web Management Components (DP LDS WMC)

To let customers register new accounts, create a dedicated `security officer` Windows account, 
and assign it a role of `Security Officer` using the AzMan console.
Then add the account name and password to the sample configuration file `/server/config.js` in the
`serviceIdentity` section:

```
module.exports = {
    site: {
        ...
        serviceIdentity: {
            username: "account-manager@contoso.com",
            password: "pa$$w0rd"
        }
    },
    ...
}
```

To let customers to enroll new credentials, add an `Enroll Self` task definition to the `Altus User`
role using the AzMan console.

When DigitalPersona LDS Web Management Components are configured, make sure the public certificate 
of its root CA is imported to the `Trusted Roots` store on the sample server. If your SSL ceritificates
are issued by your ActiveDirectory CA rather that some public CA, and if your sample server
is located a different domain, you may need to manualy import the public Root CA certificate into the
`Trusted Roots` store on the sample server machine.

Add DigitalPersona LDS Web Management Components endpoints to the sample server configuration,
in the `endpoints` section:

```
const dpWebAccessManagementServer = 'websvr-12-64.alpha.local'

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

Your sample server must use HTTPS. Create an SSL certificate (not self-signed!), import its private
key into a password-protected PFX file, copy the file into the `./certificates` folder and make sure
the sample server config has the path and password to the PFX file configured:

```
module.exports = {
    site: {
        host: 'bank.alpha.local',
        port: 443,
        sslCertificate: {
            pfxFilename: 'certificates/ssl.pfx',
            passphrase: 'test'
        },
        ...
    },
}
```


DigitalPersona LDS Server comes with an evaluation license allowing
enrollment of up to 10 users during first 30 days. If you want more
users or longer enrollment period, obtain and apply a DigitalPersona Server license.

To use SMS OTP, a Nexmo SMS gateway account must be obtained and configured.

To use Push Notifications OTP, a Push Notification API key and Tenant ID must be obtained and configured.

To use Email verification and OTP sending, a SMTP server must be configured.

To use Face credentials, an Innovatrics Face Engine license must be obtained and applied.



