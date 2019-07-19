export interface ServerSettings
{
    endpoints: {
        auth: string,
        enroll: string,
        policies: string,
        u2fAppId: string,
    };
}
