import ng from 'angular';
import translate from 'angular-translate';

// components
import app from './app';
import home from './home/home.module';
import profile from './identity';

export default ng.module('example.app', [
    translate,
    home,
    profile,
])
.component('app', app.Component)
.name;
