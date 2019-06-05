import { IComponentOptions } from 'angular';

import slider from './img-slider.jpg';
import box1 from './img-box1.jpg';
import box2 from './img-box2.jpg';
import box3 from './img-box3.jpg';

import template from './welcome.html';

export default class WelcomeControl
{
    public static Component: IComponentOptions = {
            template,
            controller: WelcomeControl,
    };

    public title: string = "Bank with peace of mind";

    private slider: string = slider;
    private box1 = box1;
    private box2 = box2;
    private box3 = box3;
}
