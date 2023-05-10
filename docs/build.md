---
layout: default
title: Build the server
has_toc: false
nav_order: 2
---
{% include header.html %}  

# Build the server

## Prerequisites

Install [Node JS](https://nodejs.org). The sample is tested in NodeJS v19.

> NOTE: It is recommended to install NodeJS using a Node Version Manager (`nvm`) or Node Version Switcher (`nvs`), which allow to install different NodeJS versions side by side and quickly switch between them.

Install [Git](https://git-scm.com/).

> NOTE: Instead of downloading and installing prerequisites one by one, you can use the [`Chocolatey` Package Manager for Windows](https://chocolatey.org/install).
Run `PowerShell` as an administrator and execute the following commands:  
>  ```ps
> > Set-ExecutionPolicy Bypass -Scope Process -Force
> > iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))
> > choco install nodejs git
>  ```

## Install the sample

**Clone the sample repository**
```
git clone {{site.data.lib.git}}/{{site.data.lib.repo}}.git
```

**Install dependencies**
```
cd {{site.data.lib.repo}}
npm install
```
**Build the site**

>* For production:
```
>npm run build-prod
```

>* For development:
```
>npm run build-dev
```

---
Next: [Configure the server](./configure.md).
