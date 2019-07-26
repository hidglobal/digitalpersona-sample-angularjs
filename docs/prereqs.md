---
layout: default
title: Prerequisites
has_toc: false
nav_order: 1
---
{% include header.html %}  

# Prerequisites

## Software

The sample requires following products to be installed and configured:

* Windows ADAM Service (LDS)
* DigitalPersona LDS Server (DP LDS Server)
* DigitalPersona LDS Administration Tools (DP LDS AT)
* DigitalPersona LDS Web Management Components (DP LDS WMC)

## LDS Web Management Components

DP LDS WMC services must be accessible from the Internet using DNS.
They must use HTTPS with a certificate signed by a public certification autheority (CA).
Self-signed certificates won't be accepted (running in development mode is an exception).

## DigitalPersona LDS Server

PD LDS Server comes with an evaluation license allowing enrollment of up to 10 users 
during first 30 days. If you want more users or longer enrollment period, 
obtain and apply a DigitalPersona Server license.

## Additional prerequisites 

To use Face credentials, an Innovatrics Face Engine license must be obtained and applied.

To use SMS OTP, a Nexmo SMS gateway account must be obtained and configured.

To use Push Notifications OTP, a Push Notification API key and Tenant ID must be obtained and configured.

To use Email verification and OTP sending, a SMTP server must be configured.

---
Next: [Build the server](./build)
