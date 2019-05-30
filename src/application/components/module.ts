import ng from 'angular';

import UsernameControl from './fields/username/username';
import PasswordControl from './fields/password/password';
import CredSelectorControl from './credSelector/credSelector';

import mustMatch from './validators/mustMatch';
import mustNotMatch from './validators/mustNotMatch';

export default ng.module("example.components", [
    'ngMessages',
])
.component('username', UsernameControl.Component)
.component('password', PasswordControl.Component)
.component('credSelector', CredSelectorControl.Component)
.directive('mustMatch', mustMatch)
.directive('mustNotMatch', mustNotMatch)
.name;
