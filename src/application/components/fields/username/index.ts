import * as ng from 'angular';
import template from './template.html';
import controller from './controller';
import module from '../../module';

ng.module(module)
    .component("username", {
        template,
        controller,
        bindings: {
            value           : '@',
            name            : '@',  // field name (for the form posting)
            label           : '@',  // field label text
            placeholder     : '@',  // text to show inside the input field
            pattern         : '@',  // input pattern
            required        : '@',
            onChange        : '&',  // event fired when a password field is changed
        }
    });
