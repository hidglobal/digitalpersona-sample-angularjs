---
layout: default
title: Run the server
has_toc: false
nav_order: 4
---
{% include header.html %}  
# Run the server

## Prepare

The server uses the [`supervisor`](https://www.npmjs.com/package/supervisor) package to ensure that the server is running continuously.

Before starting the server, install the `supervisor` NPM package globally:
```
npm install supervisor -g
```

## Start the server

To start the server in production mode, open a terminal console and run:
```
npm run server
```
> NOTE: Your DP Web Components must use a valid TLS certificate signed
by a trusted certification authority (CA). Self-signed certificate won't be accepted, even if you add it into a trusted root CA container.

To start the server in development mode:
```
npm run server-dev
```
>Development mode allows you to use a self-signed TLS certificate for development purposes. Do not use them in production!

To restart the server running under `supervisor`, press *rs* in the terminal console.

You can also run a development server in NodeJS without using the `supervisor`:
```
npm run node-dev
```

## Open the demo application

Once the server is started, open the  main page of the sample in your web browser.  

![](assets/BODP-Main-page.png)

Click *Sign up* to create a demo account,  

![](assets/BODP-sign-up.png)

then sign in with your newly created password.

![](assets/BODP-sign-in.png)

Click your user name to display your user information and select the Security tab to add more authentication methods and start using multifactor authentication.

![](assets/BODP-add-methods.png)

## Stop the server

To stop the server, press *Ctrl-C* in the terminal console.
