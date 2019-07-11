import { IComponentOptions, IAugmentedJQuery, ITimeoutService } from 'angular';
import { BioSample, FaceImage } from '@digitalpersona/core';

import * as faceapi from 'face-api.js';
import './models/tiny_face_detector_model-weights_manifest.json';
import 'copy!./models/tiny_face_detector_model-shard1';

import template from './faceCapture.html';

export default class FaceCaptureControl
{
    public static Component: IComponentOptions = {
        template,
        controller: FaceCaptureControl,
        bindings: {
            capturing: "=",
            sampleCount: "<",
            sampleInterval: "<",
            maxDetectionTime: "<",
            minScore: "<",
            onStart: "&",
            onStop: "&",
            onCaptured: "&",
            onError: "&",
        },
    };

    public capturing: boolean;
    public sampleCount: number;
    public sampleInterval: number;
    public maxDetectionTime: number;
    public minScore: number;

    public onStart    : () => void;
    public onStop     : () => void;
    public onCaptured : (locals: {samples: BioSample[]}) => void;
    public onError    : (locals: {error?: Error }) => void;

    private video: HTMLVideoElement;
    private canvas: HTMLCanvasElement;
    private loaded: boolean = false;
    private transitional: boolean;
    private imageCanvas = document.createElement("canvas");

    private samples: BioSample[] = [];
    private lastSampleTaken: number | null = null;

    public static $inject = ["$element", "$timeout"];
    constructor(
        private $element: IAugmentedJQuery,
        private $timeout: ITimeoutService,
    ) {
    }

    public async $onInit() {
        await faceapi.loadTinyFaceDetectorModel('/application/components/faceCapture/models');
        this.loaded = true;
        this.capturing = false;
        this.transitional = false;
    }

    public $postLink() {
        this.video = this.$element.find('video')[0] as HTMLVideoElement;
        this.canvas = this.$element.find('canvas')[0] as HTMLCanvasElement;
        this.video.onloadedmetadata = this.handleNextFrame.bind(this);
    }

    public async $doCheck() {
        if (!this.video) return;
        const playing = !this.video.paused;
        if (this.capturing === playing) return;
        if (this.transitional) return;
        await (this.capturing ? this.startCapture() : this.stopCapture());
    }

    private emitOnStart() {
        if (this.onStart) this.onStart();
    }
    private emitOnStop() {
        if (this.onStop) this.onStop();
    }
    private emitOnCaptured(samples: BioSample[]) {
        if (this.onCaptured) this.onCaptured({samples});
    }
    private emitOnError(error: Error) {
        if (this.onError) this.onError({error});
    }

    private async handleNextFrame() {
        if (this.video.paused || this.video.ended || !this.loaded)
            return this.$timeout(() => { this.handleNextFrame(); });

        if (this.video.currentTime > this.maxDetectionTime) {
            this.stopCapture();
            this.emitOnError(new Error('Face.Quality.NoFace'));
        }
        const detections = await this.detectFace();
        if (detections && detections.length > 0) {
            if (detections.length > 1) {
                this.stopCapture();
                this.emitOnError(new Error('Face.Quality.TooMany'));
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
            || (this.lastSampleTaken < (now - this.sampleInterval))
            ){
                const sample = this.collectSample();
                if (sample) {
                    this.samples.push(sample);
                    this.lastSampleTaken = now;
                    if (this.samples.length === this.sampleCount) {
                        this.stopCapture();
                        this.emitOnCaptured(this.samples);
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

    private async startCapture() {
        try {
            if (this.transitional) return;
            this.transitional = true;
            const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
            this.video.srcObject = stream;
            console.log("play()");
            await this.video.play();
            this.capturing = true;
            this.emitOnStart();
        } catch (error) {
            this.emitOnError(error);
        } finally {
            this.transitional = false;
        }
    }

    private stopCapture() {
        try {
            if (this.transitional) return;
            this.transitional = true;
            const stream = this.video.srcObject as MediaStream;
            if (stream) {
                stream.getVideoTracks().forEach(track => track.stop());
                console.log("pause()");
                this.video.pause();
                this.capturing = false;
                this.emitOnStop();
            }
        } catch (error) {
            this.emitOnError(error);
        } finally {
            this.transitional = false;
        }
    }

    private async detectFace(){
        return await faceapi
            .detectAllFaces(this.video, new faceapi.TinyFaceDetectorOptions({
                inputSize: 160,
                scoreThreshold: this.minScore,
            }));
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
            ctx.lineWidth = 10;
            ctx.setLineDash([3, 5]);
            const tickAngle = 2 * Math.PI / (this.sampleCount - 1);
            const start = Math.PI / 2;
            ctx.arc(c.x, c.y, c.r * 1.3 + 5, start + tickAngle * this.samples.length, start, true);
            ctx.stroke();
        } else {
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        }
    }

}
