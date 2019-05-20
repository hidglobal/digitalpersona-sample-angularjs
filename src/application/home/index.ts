import * as ng from 'angular';
import template from './template.html';
import controller from './controller';
import module from './module';

ng.module(module)
    .component('home', {
        template,
        controller,
    })
