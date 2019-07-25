import { IComponentOptions } from 'angular';

import template from './consent.html';

export default class DataProcessingConsentControl
{
    public static Component: IComponentOptions = {
        template,
        controller: DataProcessingConsentControl,
        transclude: true,
    };

    private static KEY = "DataProcessingConsentGivenAt";

    private consentGiven() {
        return !!window.localStorage.getItem(DataProcessingConsentControl.KEY);
    }

    private submit() {
        window.localStorage.setItem(DataProcessingConsentControl.KEY, `${ new Date().toUTCString() }`);
    }
}
