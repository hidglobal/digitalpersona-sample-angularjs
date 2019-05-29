import ng from 'angular';
import template from './template.html';
import controller from './controller';
import module from '../module';

ng.module(module)
    .component("signin", {
        template,
        controller,
    });
