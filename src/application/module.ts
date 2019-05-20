import * as ng from 'angular';

// components
import home from './home/module';
import entrance from './entrance/module';

export default ng
    .module('example.app', [
        home,
        entrance,
    ]).name
