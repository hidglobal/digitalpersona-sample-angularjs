import { IComponentOptions, IAugmentedJQuery, ITimeoutService } from 'angular';
import * as faceapi from 'face-api.js';
import { Credential, BioSample, FaceImage } from '@digitalpersona/core';
import { IAuthService, ServiceError } from '@digitalpersona/services';
import { FaceAuth } from '@digitalpersona/authentication';

import { TokenAuth } from '../tokenAuth';
import './models/tiny_face_detector_model-weights_manifest.json';
import 'copy!./models/tiny_face_detector_model-shard1';
import template from './faceAuth.html';

export default class FaceAuthControl extends TokenAuth
{
    public static readonly Component: IComponentOptions = {
        ...TokenAuth.Component,
        template,
        controller: FaceAuthControl,
    };

    private static readonly SAMPLE_COUNT = 10;       // we need to collect 3 samples
    private static readonly SAMPLE_INTERVAL = 500;  // with 100 ms between consequtive samples

    private static readonly MAX_DETECTION_TIME: number = 30;
    private static readonly faceDetectorOptions = new faceapi.TinyFaceDetectorOptions({
        inputSize: 160,
        scoreThreshold: 0.3,
    });

    private video: HTMLVideoElement;
    private canvas: HTMLCanvasElement;
    private loaded: boolean = false;
    private hasFace: boolean = false;

    private imageCanvas = document.createElement("canvas");

    private samples: BioSample[] = [];
    private lastSampleTaken: number | null = null;

    public static $inject = ["AuthService", "$element", "$timeout"];
    constructor(
        private authService: IAuthService,
        private $element: IAugmentedJQuery,
        private $timeout: ITimeoutService,
    ) {
        super(Credential.Face);
    }

    public async $onInit() {
        this.video = this.$element.find('video')[0] as HTMLVideoElement;
        this.canvas = this.$element.find('canvas')[0] as HTMLCanvasElement;

        await faceapi.loadTinyFaceDetectorModel('/application/identity/tokens/face/models');

        this.loaded = true;

        this.video.onloadedmetadata = this.handleNextFrame.bind(this);
    }

    private async handleNextFrame() {
        if (this.video.paused || this.video.ended || !this.loaded)
            return this.$timeout(() => { this.handleNextFrame(); });

        if (this.video.currentTime > FaceAuthControl.MAX_DETECTION_TIME) {
            this.stopCapture();
            super.emitOnError(new Error('Face.Quality.NoFace'));
        }
        const detections = await this.detectFace();
        if (detections && detections.length > 0) {
            if (detections.length > 1) {
                this.stopCapture();
                super.emitOnError(new Error('Face.Quality.TooMany'));
            }
            const dims = {
                width: this.video.offsetWidth,
                height: this.video.offsetHeight,
            };
            if (dims.width && dims.height) {
                this.canvas.width = dims.width;
                this.canvas.height = dims.height;
                const scaled = faceapi.resizeResults(detections, dims);

                this.drawFaceBoundaries(scaled[0].box);
            }
            const now = new Date().getTime();
            if (!this.lastSampleTaken
            || (this.lastSampleTaken < (now - FaceAuthControl.SAMPLE_INTERVAL))
            ){
                const sample = this.collectSample();
                if (sample) {
                    this.samples.push(sample);
                    this.lastSampleTaken = now;
                    if (this.samples.length === FaceAuthControl.SAMPLE_COUNT) {
                        this.stopCapture();
                        this.submit();
                    }
                }
            }
        } else {
            // reset if detection has interrupted
            this.samples = [];
            this.lastSampleTaken = null;
            this.drawFaceBoundaries(null);
        }
        return this.$timeout(() => { this.handleNextFrame(); });
    }

    public toggleCapture() {
        if (this.video.paused)
            this.startCapture();
        else
            this.stopCapture();
    }

    private async startCapture() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
            this.video.srcObject = stream;
            await this.video.play();
            super.resetError();
            super.emitOnUpdate();
        } catch (error) {
            super.emitOnError(error);
        }
    }

    private stopCapture() {
        const stream = this.video.srcObject as MediaStream;
        if (stream) {
            stream.getVideoTracks().forEach(track => track.stop());
            this.video.pause();
            super.emitOnUpdate();
        }
    }

    public async submit() {
        super.emitOnBusy();
        const auth = new FaceAuth(this.authService);
        try {
            const token = await (!this.user.name
                ? auth.identify(this.samples)                           // NOT SUPPORTED YET!
                : auth.authenticate(this.identity, this.samples));
            super.emitOnToken(token);
        } catch (error) {
            super.emitOnError(new Error(this.mapServiceError(error)));
        } finally {
            this.samples = [];
            this.lastSampleTaken = null;
        }
    }

    private async detectFace(){
        return await faceapi
            .detectAllFaces(this.video, FaceAuthControl.faceDetectorOptions);
    }

    private collectSample() {
        this.imageCanvas.width = this.video.videoWidth;
        this.imageCanvas.height = this.video.videoHeight;
        const ctx = this.imageCanvas.getContext("2d");
        if (ctx) {
            ctx.drawImage(this.video, 0, 0, this.video.videoWidth, this.video.videoHeight);
            const image = FaceImage.fromCanvas(this.imageCanvas);
            return image.toBioSample();
        }
        return null;
    }

    private drawFaceBoundaries(box: faceapi.Box | null) {
        const ctx = this.canvas.getContext('2d');
        if (!ctx) return;
        ctx.save();
        ctx.beginPath();

        if (box) {
            const r = box.width / 1.5;
            const c = {
                x: (box.right + box.left) / 2,
                y: (box.top + box.bottom) / 2 - r / 5,   // slightly rise the boundary for better centering
                r,
            };
            ctx.strokeStyle = "rgb(255,255,255,0)";
            ctx.fillStyle = "rgb(255,255,255,0.5)";
            ctx.arc(c.x, c.y, ctx.canvas.width * 2, 0, 2 * Math.PI, false);
            ctx.arc(c.x, c.y, c.r * 1.3, 0, 2 * Math.PI, true);
            ctx.fill();
            ctx.beginPath();
            ctx.strokeStyle = "rgb(0,128,0)";
            ctx.lineWidth = 3;
            const tickAngle = 2 * Math.PI / (FaceAuthControl.SAMPLE_COUNT - 1);
            const start = Math.PI / 2;
            ctx.arc(c.x, c.y, c.r * 1.3, start + tickAngle * this.samples.length, start, true);
            ctx.stroke();
        } else {
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        }
    }

    private mapServiceError(error: ServiceError) {
        switch (error.code) {
            case -2146893043:
            case -2003292320: return 'Face.Error.NoMatch';
            case -2146893042: return 'Face.Error.NotEnrolled';
            default: return error.message;
        }
    }
}
