import cards from '../images/credentials/cards.png';
import face from '../images/credentials/face.png';
import u2f from '../images/credentials/fido.png';
import fp from '../images/credentials/fingerprints.png';
import otp from '../images/credentials/oneTimePassword.png';
import pwd from '../images/credentials/password.png';
import pin from '../images/credentials/pin.png';
import recovery from '../images/credentials/recoveryQuestions.png';

import { Credential } from '@digitalpersona/core';
import { ReadyBy, CredInfo } from './credInfo';

export default {
    all: <CredInfo[]>[
        { id: Credential.Password       , name: "Password"          ,  icon: pwd    , strength: 1   , ident: false  , readyBy: ReadyBy.Input    ,},
        { id: Credential.Fingerprints   , name: "Fingerprints"      ,  icon: fp     , strength: 3   , ident: true   , readyBy: ReadyBy.Gesture  ,},
        { id: Credential.SmartCard      , name: "Cards"             ,  icon: cards  , strength: 3   , ident: false  , readyBy: ReadyBy.Input    ,},
        { id: Credential.ContactlessCard, name: "Cards"             ,  icon: cards  , strength: 3   , ident: true   , readyBy: ReadyBy.Gesture  ,},
        { id: Credential.ProximityCard  , name: "Cards"             ,  icon: cards  , strength: 3   , ident: true   , readyBy: ReadyBy.Gesture  ,},
        { id: Credential.U2F            , name: "U2F"               ,  icon: u2f    , strength: 3   , ident: false  , readyBy: ReadyBy.Gesture  ,},
        { id: Credential.OneTimePassword, name: "OTP"               ,  icon: otp    , strength: 2   , ident: false  , readyBy: ReadyBy.Input    ,},
        { id: Credential.Face           , name: "Face"              ,  icon: face   , strength: 1   , ident: false  , readyBy: ReadyBy.Presence ,},
        { id: Credential.PIN            , name: "PIN"               ,  icon: pin    , strength: 1   , ident: false  , readyBy: ReadyBy.Input    ,},
    ]
}
