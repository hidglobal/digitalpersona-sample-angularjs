import * as ng from 'angular';
import components from '../components/module';
import auth from '../components/tokens/auth.module';

export default ng
    .module('example.entrance', [
        components,
        auth,
    ])
    .name;
