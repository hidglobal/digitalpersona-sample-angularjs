import * as ng from 'angular';
import template from './template.html';
import controller from './controller';
import module from '../module';
import '../../fields/password';

ng.module(module)
    .component("passwordAuth", {
        template,
        controller,
        bindings: {
            identity: "<",
            onBusy: "&",
            onToken: "&",
            onError: "&",
        }
    })
