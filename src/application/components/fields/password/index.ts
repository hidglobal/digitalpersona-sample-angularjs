import * as ng from 'angular';
import 'angular-messages';
import template from './template.html';
import controller from './controller';
import module from '../../module';
import 'font-awesome/scss/font-awesome.scss';

ng.module(module)
    .component("password", {
        template,
        controller,
        bindings: {
            name            : '@',  // field name (for the form posting)
            label           : '@',  // field label text
            hidden          : '@',  // is the field hidden
            onChange        : '&',  // event fired when a password field is changed
        }
    });

