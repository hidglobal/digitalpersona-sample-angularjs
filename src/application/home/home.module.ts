import ng from 'angular';
import route from 'angular-route';

import identity from '../identity';

import routes from './home.routes';

import home from './home';
import welcome from './welcome/welcome';
import main from './main/main';

export default ng.module('example.home', [
    route,
    identity,
])
.config(routes)
.component('home', home.Component)
.component('welcome', welcome.Component)
.component('main', main.Component)
.name;
