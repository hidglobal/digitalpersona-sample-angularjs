import ng from 'angular';

import UsernameControl from './fields/username/username';
import PasswordControl from './fields/password/password';

import mustMatch from './validators/mustMatch';
import mustNotMatch from './validators/mustNotMatch';

export default ng.module("example.components", [
    'ngMessages',
])
.component('username', UsernameControl.Component)
.component('password', PasswordControl.Component)
.directive('mustMatch', mustMatch)
.directive('mustNotMatch', mustNotMatch)
.name;
