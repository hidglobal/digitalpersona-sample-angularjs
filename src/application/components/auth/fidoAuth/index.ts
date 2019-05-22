import * as ng from 'angular';
import module from '../module';
import controller from './controller';
import template from './template.html';

ng.module(module)
    .component('fidoAuth', {
        template,
        controller,
        bindings: {
            identity: "<",
            onBusy: "&",
            onUpdate: "&",
            onToken: "&",
            onError: "&",
        }
    });
