import * as ng from 'angular';

require('../../../../models/tiny_face_detector_model-shard1')
require('../../../../models/tiny_face_detector_model-weights_manifest.json')

import template from './template.html';
import controller from './controller';
import module from '../module';

ng.module(module)
    .component("faceAuth", {
        template,
        controller,
        bindings: {
            identity: "<",
            onBusy: "&",
            onUpdate: "&",
            onToken: "&",
            onError: "&",
        }
    })
