import * as ng from 'angular';

// components
import template from './template.html';
import controller from './controller';
import module from './module';

ng.module(module)
    .component("app", {
        template,
        controller,
    });


