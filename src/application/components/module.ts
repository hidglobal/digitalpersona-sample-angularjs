import ng from 'angular';

import UsernameControl from './fields/username/username';
import PasswordControl from './fields/password/password';
import CreatePasswordControl from './fields/createPassword/createPassword';
import CredSelectorControl from './credSelector/credSelector';

export default ng.module("example.components", [
    'ngMessages',
])
.component('username', UsernameControl.Component)
.component('password', PasswordControl.Component)
.component('createPassword', CreatePasswordControl.Component)
.component('credSelector', CredSelectorControl.Component)
.name;
