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
        u2fAppId: `https://${dpWebAccessManagementServer}/DPFido/app-id.json`
    },
}
