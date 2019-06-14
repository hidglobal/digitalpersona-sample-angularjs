import ng from 'angular';

import components from '../../components';

import SupportedCredentials from './configuration/supportedCredentials';

import PasswordChangeControl from './password/passwordChange';
import PinChangeControl from './pin/pinChange';
import FingeprintsChangeControl from './fingerprints/fingerprintsChange';
import FaceChangeControl from './face/faceChange';
import FidoChangeControl from './u2f/fidoChange';
import cards from './cards/cardsChange';
import smartCard from './cards/smartCard/smartCardChange';
import contactlessCard from './cards/contactlessCard/contactlessCardChange';
import proximityCards from './cards/proximityCard/proximityCardChange';
import otp from './otp/otpChange';

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
.component('cardsChange', cards.Component)
.component('smartCardChange', smartCard.Component)
.component('contactlessCardChange', contactlessCard.Component)
.component('proximityCardChange', proximityCards.Component)
.component('otpChange', otp.Component)
.name;
