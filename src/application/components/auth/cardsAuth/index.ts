import * as ng from 'angular';
import template from './template.html';
import controller from './controller';
import module from '../module';
import '../../fields/username';
import '../../fields/password';
import '../smartCardAuth';
import '../contactlessCardAuth';
import '../proximityCardAuth';

ng.module(module)
    .component("cardsAuth", {
        template,
        controller,
        transclude: true,
        bindings: {
            identity: "<",
            reader: "<",
            onBusy: "&",
            onUpdate: "&",
            onToken: "&",
            onError: "&",
        }
    })
