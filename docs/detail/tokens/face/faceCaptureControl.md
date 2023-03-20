---
layout: default
title: FaceCaptureControl
has_toc: false
nav_exclude: true
---
{% include header.html %}  

# FaceCaptureControl

The `FaceCaptureControl` is a composite AngularJS component which captures video
stream from a camera, looks for face-like features and automatically makes several
snapshots to be used as biometric samples.

The TypeScript source code for the component is located [here](../../../../src/application/components/faceCapture).

## API

The `FaceCaptureControl` has following API:

Attributes:
* `sampleCount: number`       - a number of samples to make to complete the capture
* `sampleInterval: number`    - a minimum time in milliseconds between two samples
* `maxDetectionTime: number`  - a maximum time to wait for a face detection; when exceeded, the capturing mode cancels
* `minScore: number`          - a minimum score (0..1) to make a sample eligible to be collected
* `capturing: boolean`        - a two-way property; `true` when the capture mode is active; `false` otherwise.
    
Events:
* `onStart: () => void`                           - fires when the control entered a capturing mode
* `onStop: () => void`                            - fires when the control exited a capturing mode
* `onCaptured: ({samples: BioSample[]}) => void`  - fires when the control collected `sampleCount` samples scored not less than the `minScore`; the samples are passed as an array of `BioSample`s stored in the `samples` property of the event parameter object
* `onError: ({error?: Error }) => void;`          - fires when the control experienced any error; the error details are passed in the `error` property of the event parameter object

## Usage example

[faceAuth.html](../../../../src/application/components/faceCapture/faceCapture.html)
```html
<div>
    ...
    <face-capture
        sample-count="10"
        sample-interval="100"
        max-detection-time="30"
        min-score="0.3"
        capturing="$ctrl.capturing"
        on-start="$ctrl.handleStartCapture()"
        on-stop="$ctrl.handleStopCapture()"
        on-captured="$ctrl.handleCaptured(samples)"
        on-error="$ctrl.handleCaptureError(error)"
    ></face-capture>
    ...
</div>
```

[faceAuth.ts](../../../../src/application/components/faceCapture/faceCapture.ts)
```ts
// NOTE: needs a webpack to support such import of HTML template; otherwise use inline template or any other means
import template from './faceAuth.html';

import { Credential, BioSample } from '@digitalpersona/core';

class FaceAuthControl
{
    public static readonly Component: IComponentOptions = {
        template,
        controller: FaceAuthControl,
    };

    // binds to the `capturing` attribute of the <face-capture> element
    private capturing: boolean = false;

    // binds to the `on-start` event of the <face-capture> element
    private handleStartCapture() { ... }

    // binds to the `on-stop` event of the <face-capture> element
    private handleStopCapture() { ... }

    // binds to the `on-error` event of the <face-capture> element
    private handleCaptureError(error: Error) { ... }

    // binds to the `on-captured` event of the <face-capture> element
    private async handleCaptured(samples: BioSample[]) { ... }
}
```

## Internal details

The `FaceCaptureControl` relies on following technologoes:

* browser's native [Media Capture and Streams API](https://developer.mozilla.org/en-US/docs/Web/API/Media_Capture_and_Streams_API) - to open a video stream from a video camera and capture snapshots
* [face-api.js](https://github.com/justadudewhohacks/face-api.js/) -- a third-party
library by Vincent Mühler, used for a preliminary face detection and quality scoring
on a browser side before sending samples to the server for processing with a full
face recognition engine.

### Control template

The control HTML tempalte consists of two major elements in a root `<div>`:

```html
<div>
    <video muted ...></video>
    <canvas ...></canvas>
</div>
```

The `<video>` element in the control template allows users to see their own face and position properly. The `<canvas>` element in the control template is overlayed on the `<video>` element and allows to draw a face region and progress feedback right over the video output.

### Control behavior

When the `FaceCaptureControl` is initialized (`$onInit`), it loads the `face-api.js` detector model and resets itself to start in a non-capturing mode.

When the `FaceCaptureControl`is loaded into a page and linked with its HTML element (`$postLink`), it creates references to `<video>` and `<canvas>` elements embedded
into the control template, and then sets up an event handler to process incoming video frames.

To start the capturing mode, either call the `startCapture` method, or set the `capturing` property to `true`. When capturing is starting, the control will try to find and open a camera using a `navigator.mediaDevices`, and bind the camera stream output with the `<video>` element, so users are able to see their own face and position properly. When video capture is started, a `onStart` event will be fired.

When in capturing mode, each video frame is sent to the `handleNextFrame` event handler
that was set up in the `$postLink` method. The handler first checks if the capture
is still on and not paused, and the frame should be skipped. Then it checks if
the `maxDetectionTime` was exceeded without a single detection, and cancels the capture mode if so. Then it passes the frame through the face detector provided by the `face-api.js` library. 

If there are more than one face is detected, the capture stops with a "Too many faces" error.

When one and only one face is detected, the control uses the `<canvas>` element to draw
an a face detection overlay, in a form of circle focused on the face and
shaded outside of the face, and an arc around the circle area growing with each sample taken, to give users a sense of progress. See `drawFaceBoundaries` method.

If a detection score of the face is not less than the `minScore`, the snapshots will be collected as a new sample, given that previous sample was collected not earlier than `sampleInterval` milliseconds ago; this sampling interval allows to collect samples in slightly different positions.

When `sampleCount` samples are collected, The capture stops, firing an `onStopCapture` event, and an `onCaptured` event is fired with an array of collected samples. At this
point the application can send the face samples to the server for enrollment or authentication.
