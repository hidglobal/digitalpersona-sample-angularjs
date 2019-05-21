import { AuthController } from '../authController';
import { Credential, BioSample, FaceImage } from '@digitalpersona/core';
import * as faceapi from 'face-api.js';
import { IAugmentedJQuery, ITimeoutService } from 'angular';
import { FaceAuth } from '@digitalpersona/authentication';
import { IAuthService, ServiceError } from '@digitalpersona/services';
import { URL_PROPERTIES } from '@tensorflow/tfjs-core/dist/environment_util';

export default class FaceAuthController extends AuthController
{
    static readonly SAMPLE_COUNT = 10;       // we need to collect 3 samples
    static readonly SAMPLE_INTERVAL = 500;  // with 100 ms between consequtive samples

    static readonly MAX_DETECTION_TIME: number = 30;
    static readonly useTinyModel = true
    static readonly faceDetectorOptions = new faceapi.TinyFaceDetectorOptions({
        inputSize: 160,
        scoreThreshold: 0.3
    })

    private video: HTMLVideoElement;
    private canvas: HTMLCanvasElement;
    private loaded: boolean = false;
    private hasFace: boolean = false;

    private imageCanvas = document.createElement("canvas");

    private samples: BioSample[] = [];
    private lastSampleTaken: number | null = null;

    static $inject = ["AuthService", "$element", "$timeout"]
    constructor(
        private authService: IAuthService,
        private $element: IAugmentedJQuery,
        private $timeout: ITimeoutService,
    ) {
        super(Credential.Face)
    }

    async $onInit() {
        this.video = this.$element.find('video')[0] as HTMLVideoElement;
        this.canvas = this.$element.find('canvas')[0] as HTMLCanvasElement;

        await faceapi.loadTinyFaceDetectorModel('/models')

        this.loaded = true;

        this.video.onloadedmetadata = this.handleNextFrame.bind(this);
    }

    $onDestroy() {
    }

    async handleNextFrame() {
        if (this.video.paused || this.video.ended || !this.loaded)
            return this.$timeout(()=>{this.handleNextFrame()})

        if (this.video.currentTime > FaceAuthController.MAX_DETECTION_TIME) {
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
                height: this.video.offsetHeight
            }
            if (dims.width && dims.height) {
                this.canvas.width = dims.width;
                this.canvas.height = dims.height;
                const scaled = faceapi.resizeResults(detections, dims)

                this.drawFaceBoundaries(scaled[0].box);
            }
            const now = new Date().getTime()
            if (!this.lastSampleTaken
            || (this.lastSampleTaken < (now - FaceAuthController.SAMPLE_INTERVAL))
            ){
                const sample = this.collectSample();
                if (sample) {
                    this.samples.push(sample);
                    this.lastSampleTaken = now;
                    if (this.samples.length === FaceAuthController.SAMPLE_COUNT) {
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
        return this.$timeout(()=>{this.handleNextFrame()})
    }

    toggleCapture() {
        if (this.video.paused)
            this.startCapture()
        else
            this.stopCapture()
    }
    async startCapture() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: {} })
            this.video.srcObject = stream;
            await this.video.play()
            super.resetError();
            super.emitOnUpdate();
        } catch(error) {
            super.emitOnError(error);
        }
    }

    stopCapture() {
        const stream = this.video.srcObject as MediaStream;
        if (stream) {
            stream.getVideoTracks().forEach(track => track.stop());
            this.video.pause();
            super.emitOnUpdate();
        }
    }

    async submit() {
        super.emitOnBusy();
        const auth = new FaceAuth(this.authService)
        try {
            const token = await (!this.user.name
                ? auth.identify(this.samples)                           // NOT SUPPORTED YET!
                : auth.authenticate(this.identity, this.samples));
            super.emitOnToken(token);
        } catch(error) {
            super.emitOnError(new Error(this.mapServiceError(error)));
        } finally {
            this.samples = [];
            this.lastSampleTaken = null;
        }
    }

    async detectFace(){
        return await faceapi
            .detectAllFaces(this.video, FaceAuthController.faceDetectorOptions);
    }

    collectSample() {
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

    drawFaceBoundaries(box: faceapi.Box | null) {
        const ctx = this.canvas.getContext('2d');
        if (!ctx) return;
        ctx.save();
        ctx.beginPath();

        if (box) {
            const r = box.width/1.5
            const c = {
                x: (box.right + box.left)/2,
                y: (box.top + box.bottom)/2 - r/5,   // slightly rise the boundary for better centering
                r
            }
            ctx.strokeStyle = "rgb(255,255,255,0)";
            ctx.fillStyle = "rgb(255,255,255,0.5)";
            ctx.arc(c.x, c.y, ctx.canvas.width * 2, 0, 2*Math.PI, false);
            ctx.arc(c.x, c.y, c.r * 1.3, 0, 2*Math.PI, true);
            ctx.fill();
            ctx.beginPath();
            ctx.strokeStyle = "rgb(0,128,0)";
            ctx.lineWidth = 3;
            const tickAngle = 2*Math.PI / (FaceAuthController.SAMPLE_COUNT-1);
            const start = Math.PI / 2;
            ctx.arc(c.x, c.y, c.r * 1.3, start + tickAngle * this.samples.length, start, true);
            ctx.stroke();
        } else {
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        }
    }

    mapServiceError(error: ServiceError) {
        switch(error.code) {
            case -2146893043:
            case -2003292320: return 'Face.Error.NoMatch';
            default: return error.message;
        }
    }
}
