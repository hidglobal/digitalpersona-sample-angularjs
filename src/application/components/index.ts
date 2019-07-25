import ng from 'angular';

import TextControl from './fields/text/text';
import UsernameControl from './fields/username/username';
import PasswordControl from './fields/password/password';
import AlertControl from './alert/alert';
import FaceCaptureControl from './faceCapture/faceCapture';

import activityView from './activityView/activityView';

import mustMatch from './validators/mustMatch';
import mustNotMatch from './validators/mustNotMatch';

export default ng.module("example.components", [
    'ngMessages',
])
.component('text', TextControl.Component)
.component('username', UsernameControl.Component)
.component('password', PasswordControl.Component)
.component('alert', AlertControl.Component)
.component('faceCapture', FaceCaptureControl.Component)
.component('activityView', activityView.Component)
.directive('mustMatch', mustMatch)
.directive('mustNotMatch', mustNotMatch)
.name;
