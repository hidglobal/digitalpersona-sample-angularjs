import * as ng from 'angular';
import template from './template.html';
import controller from './controller';
import module from '../module';
import '../../fields/username';
import '../../fields/password';

ng.module(module)
    .component("pinAuth", {
        template,
        controller,
        bindings: {
            identity: "<",
            onBusy: "&",
            onUpdate: "&",
            onToken: "&",
            onError: "&",
        }
    })
