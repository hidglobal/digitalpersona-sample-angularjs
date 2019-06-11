import ng from 'angular';

import components from '../../components';

import SupportedCredentials from './configuration/supportedCredentials';

import PasswordChangeControl from './password/passwordChange';
import PinChangeControl from './pin/pinChange';
import FingeprintsChangeControl from './fingerprints/fingerprintsChange';
import FaceChangeControl from './face/faceChange';
import FidoChangeControl from './u2f/fidoChange';

export default ng
.module("example.identity.tokens.enroll", [
    components,
])
.value("SupportedCredentials", SupportedCredentials)
.component('passwordChange', PasswordChangeControl.Component)
.component('pinChange', PinChangeControl.Component)
.component('fingerprintsChange', FingeprintsChangeControl.Component)
.component('faceChange', FaceChangeControl.Component)
.component('fidoChange', FidoChangeControl.Component)
.name;
