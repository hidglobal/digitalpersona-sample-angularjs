import * as ng from 'angular';
import components from '../components/module';
import auth from '../components/tokens/auth.module';

import signin from './signin/signin';
import signup from './signup/signup';

export default ng.module('example.entrance', [
    components,
    auth,
])
.component('signin', signin.Component)
.component('signup', signup.Component)
.name;
