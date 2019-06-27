import { IHttpService } from 'angular';
import { JSONWebToken, User } from '@digitalpersona/core';

export default class UserService
{
    public static $inject = ["$http"];
    constructor(
        private $http: IHttpService,
    ){
    }

    public async create(username: string, password: string) {
        const res = await this.$http.post('/api/user',
            { username, password },
        );
        // switch (res.status) {
        //     case 201: return;
        //     case 200:
        // }

    }

    public delete(identity: JSONWebToken) {
        const user = User.fromJWT(identity);
        return this.$http.delete('/api/user', {
                params: {
                    username: user.name,
                },
                headers: {
                    Authorization: `Bearer ${identity}`,
                },
            },
        );
    }
}
