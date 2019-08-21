const dpWebAccessManagementServer = 'websvr-12-64.alpha.local'

module.exports = {
    site: {
        host: 'bank.alpha.local',
        port: 443,
        sslCertificate: {
            pfxFilename: 'certificates/ssl.pfx',
            passphrase: 'test'
        },
        serviceIdentity: {
            username: "cam@alpha.local",
            password: "aaaAAA123"
        }
    },
    endpoints: {
        auth: `https://${dpWebAccessManagementServer}/DPWebAUTH/DPWebAUTHService.svc`,
        enroll: `https://${dpWebAccessManagementServer}/DPWebEnroll/DPWebEnrollService.svc`,
        policies: `https://${dpWebAccessManagementServer}/DPWebPolicies/DPWebPolicyService.svc`,
        claims: `https://${dpWebAccessManagementServer}/DPWebClaims/DPWebClaimsService.svc`,
        admin: `https://${dpWebAccessManagementServer}/DPWebAdmin/DPWebAdminService.svc`,
        u2fAppId: `https://${dpWebAccessManagementServer}/DPFido/app-id.json`
    },
    accounts: {
        maxAccountAge: 30,
    },
    notifications: {
        onDelete: {
            sendMail: true,
        },
    },
    mail: {
        from: 'no-reply@alpha.local',
        smtp: {
            host: 'barracuda.crossmatch.net',
            port: 25,
            secure: false,
            // auth: {
            //     user: 'cam@alpha.local',
            //     pass: 'aaaAAA123'
            // }
        },
    }
}
