import * as ng from 'angular';
import template from './template.html';
import controller from './controller';
import module from '../module';

ng.module(module)
    .component("contactlessCardAuth", {
        template,
        controller,
        bindings: {
            identity: "<",
            reader: "<",
            onBusy: "&",
            onUpdate: "&",
            onToken: "&",
            onError: "&",
        }
    });
