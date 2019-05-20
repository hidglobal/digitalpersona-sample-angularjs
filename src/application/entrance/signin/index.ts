import * as ng from 'angular';
import template from './template.html';
import controller from './controller';
import module from '../module';
import '../../components/credSelector'
import '../../components/auth/passwordAuth'
import '../../components/auth/fingerprintsAuth'
import '../../components/auth/cardsAuth'
import '../../components/auth/otpAuth'
import '../../components/auth/pinAuth'
import '../../components/auth/fidoAuth'
import '../../components/auth/faceAuth'

ng.module(module)
    .component("signin", {
        template,
        controller,
        bindings: {
        }
    });
