import slider from '../../images/img-slider.jpg';
import box1 from '../../images/img-box1.jpg';
import box2 from '../../images/img-box2.jpg';
import box3 from '../../images/img-box3.jpg';
import { IdentityService } from '../services/identity';

import './main';

export default class HomeController
{
    public title: string = "Bank with peace of mind";

    private slider: string = slider;
    private box1 = box1;
    private box2 = box2;
    private box3 = box3;

    static $inject = ["Identity"]
    constructor(
        private identity: IdentityService
    ){}
}
