import { IComponentOptions } from 'angular';
import { TokenEnroll } from '../tokenEnroll';

import template from './fingerprintsChange.html';
import { FingerprintReader } from '@digitalpersona/devices';

export default class FingerprintsChangeControl extends TokenEnroll
{
    public static readonly Component: IComponentOptions = {
        template,
        controller: FingerprintsChangeControl,
    };

    private reader: FingerprintReader;
}
