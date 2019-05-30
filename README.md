# Bank of DigitalPersona sample

This is a sample web site demonstrating usage of different DigitalPersona Web Access Management APIs.

## Prerequisites

The sample requires following products to be installed and configured:

* Windows ADAM Service (LDS)
* DigitalPersona LDS Server
* DigitalPersona LDS Administration Tools
* DigitalPersona LDS Web Management Components

To let customers register new accounts and enroll/delete new credentials, create a dedicated `security officer` Windows account, assign it a role of `Security Officer` using AzMan, and configure the sample to use the account's credentials.

DigitalPersona LDS Server comes with an evaluation license allowing
enrollment of up to 10 users during first 30 days. If you want more
users or longer enrollment period, obtain and apply a DigitalPersona Server license.

To use SMS OTP, a Nexmo SMS gateway account must be obtained and configured.

To use Push Notifications OTP, a Push Notification API key and Tenant ID must be obtained and configured.

To use Email verification and OTP sending, a SMTP server must be configured.

To use Face credentials, an Innovatrics Face Engine license must be obtained and applied.



