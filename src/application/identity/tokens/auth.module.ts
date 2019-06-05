import ng from 'angular';

import components from '../../components';

import SupportedCredentials from './configuration/supportedCredentials';

import CredSelectorControl from './credSelector/credSelector';
import CardsAuthControl from './cards/cardsAuth';
import ContactlessCardAuthControl from './contactlessCard/contactlessCardAuth';
import FaceAuthControl from './face/faceAuth';
import FingerprintsAuthControl from './fingerprints/fingerprintsAuth';
import FidoAuthControl from './u2f/fidoAuth';
import OtpAuthControl from './otp/otpAuth';
import PasswordAuthControl from './password/passwordAuth';
import PinAuthControl from './pin/pinAuth';
import ProximityCardAuthControl from './proximityCard/proximityCardAuth';
import SmartCardAuthControl from './smartCard/smartCardAuth';

export default ng
.module("example.identity.tokens.auth", [
    components,
])
.value("SupportedCredentials", SupportedCredentials)
.component('credSelector', CredSelectorControl.Component)
.component('cardsAuth', CardsAuthControl.Component)
.component('contactlessCardAuth', ContactlessCardAuthControl.Component)
.component('faceAuth', FaceAuthControl.Component)
.component('fidoAuth', FidoAuthControl.Component)
.component('fingerprintsAuth', FingerprintsAuthControl.Component)
.component('otpAuth', OtpAuthControl.Component)
.component('passwordAuth', PasswordAuthControl.Component)
.component('pinAuth', PinAuthControl.Component)
.component('proximityCardAuth', ProximityCardAuthControl.Component)
.component('smartCardAuth', SmartCardAuthControl.Component)
.name;
