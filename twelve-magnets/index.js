const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d', { willReadFrequently: true });

let shouldDrawMags = false;
let shouldDrawBalls = true;
let shouldDither = true;

let gravity = 0;
let friction = 0.01;
let bounceFactor = 0.9;
let terminalV = 2;
let magConstant = 2;
let magRadius = 10;
let ballRadius = 10;
let ballOpacity = 0.1;
let backgroundColor = 10;
let ballFeatheringSteps = 5;
let ballFeatheringThickness = 1;

let ballCount = 100;
let canvasWidth = 320;
let canvasHeight = 180;

document.querySelector("#mag-radius").oninput = function () {
    magRadius = parseFloat(this.value);
    document.querySelector("#mag-radius-value").innerHTML = magRadius;
}

document.querySelector("#ball-radius").oninput = function () {
    ballRadius = parseFloat(this.value);
    document.querySelector("#ball-radius-value").innerHTML = ballRadius;
}

document.querySelector("#gravity").oninput = function () {
    gravity = parseFloat(this.value);
    document.querySelector("#gravity-value").innerHTML = gravity;
}

document.querySelector("#friction").oninput = function () {
    friction = parseFloat(this.value);
    document.querySelector("#friction-value").innerHTML = friction;
}

document.querySelector("#bounce-factor").oninput = function () {
    bounceFactor = parseFloat(this.value);
    document.querySelector("#bounce-value").innerHTML = bounceFactor;
}

document.querySelector("#terminal-velocity").oninput = function () {
    terminalV = parseFloat(this.value);
    document.querySelector("#terminal-velocity-value").innerHTML = terminalV;
}

document.querySelector("#mag-constant").oninput = function () {
    magConstant = parseFloat(this.value);
    document.querySelector("#mag-constant-value").innerHTML = magConstant;
}

document.querySelector("#background-color").oninput = function () {
    backgroundColor = parseFloat(this.value);
    document.querySelector("#background-color-value").innerHTML = backgroundColor;
}

document.querySelector("#ball-opacity").oninput = function () {
    ballOpacity = parseFloat(this.value);
    document.querySelector("#ball-opacity-value").innerHTML = ballOpacity;
}

document.querySelector("#ball-feathering-steps").oninput = function () {
    ballFeatheringSteps = parseInt(this.value);
    document.querySelector("#ball-feathering-steps-value").innerHTML = ballFeatheringSteps;
}

document.querySelector("#ball-feathering-thick").oninput = function () {
    ballFeatheringThickness = parseInt(this.value);
    document.querySelector("#ball-feathering-thick-value").innerHTML = ballFeatheringThickness;
}

document.querySelector("#draw-mags").addEventListener('change', e => {
    shouldDrawMags = e.currentTarget.checked;
});

document.querySelector("#draw-balls").addEventListener('change', e => {
    shouldDrawBalls = e.currentTarget.checked;
});

document.querySelector("#dither").addEventListener('change', e => {
    shouldDither = e.currentTarget.checked;
});

document.querySelector("#ball-count").oninput = function () {
    ballCount = parseInt(this.value);
    document.querySelector("#ball-count-value").innerHTML = ballCount;
}

document.querySelector("#canvas-width").oninput = function () {
    canvasWidth = parseInt(this.value);
    document.querySelector("#canvas-width-value").innerHTML = canvasWidth;
}

document.querySelector("#canvas-height").oninput = function () {
    canvasHeight = parseInt(this.value);
    document.querySelector("#canvas-height-value").innerHTML = canvasHeight;
}

navigator.mediaDevices
    .getUserMedia({ video: false, audio: true })
    .then((stream) => {
        const audioCtx = new AudioContext();
        const source = audioCtx.createMediaStreamSource(stream);
        const analyzer = audioCtx.createAnalyser();
        analyzer.fftSize = 32768;

        const bufferLength = analyzer.frequencyBinCount;
        const frequencies = new Uint8Array(bufferLength);
        source.connect(analyzer);
        function animate() {
            requestAnimationFrame(animate);

            ctx.fillStyle = `rgb(${backgroundColor}, ${backgroundColor}, ${backgroundColor})`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            analyzer.getByteFrequencyData(frequencies);
            drawMagnets(frequencies, audioCtx.sampleRate);
            drawFilings();

            if (shouldDither) {
                dither(canvas, ctx);
            }
        }

        animate();
    });

class Magnet {
    constructor(x, y, name) {
        this.x = x;
        this.y = y;
        this.name = name;

        this.magnetism = 0;

        this.octaves = Object.entries(notes).filter(([n, f]) => n.slice(0, -1) === name).map(([n, f]) => f);
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = `rgb(${this.magnetism}, ${this.magnetism}, ${this.magnetism})`;
        ctx.fill();
        ctx.closePath();
    }

    update(m) {
        this.radius = magRadius;

        this.magnetism *= 0.9;
        this.magnetism += m;
        if (this.magnetism > 255) {
            this.magnetism = 255;
        } else if (this.magnetism < 0) {
            this.magnetism = 0;
        }

        if (shouldDrawMags) {
            this.draw();
        }
    }
}

class Filing {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.xVel = 0;
        this.yVel = 0;

        this.color = 'white';

        this.charge = 0 + (Math.random());
    }

    draw() {
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.globalAlpha = ballOpacity;
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fill();
        ctx.closePath();

        // feathering
        ctx.strokeStyle = 'white';
        for (let i = 0; i < ballFeatheringSteps; i++) {
            ctx.beginPath();
            ctx.lineWidth = ballFeatheringThickness;
            ctx.globalAlpha = ballOpacity * (1 - (i / ballFeatheringSteps));
            const rad = this.radius - (ballFeatheringThickness / 2) + ((i + 1) * ballFeatheringThickness);
            ctx.arc(this.x, this.y, rad, 0, Math.PI * 2, false);
            ctx.stroke();
        }

        ctx.globalAlpha = 1;
    }

    update(xAccel, yAccel) {
        this.radius = ballRadius;

        // static accelerations
        this.yVel += gravity;
        this.yVel = this.yVel * (1 - friction);
        this.xVel = this.xVel * (1 - friction);

        // supplied accelerations
        this.xVel += xAccel;
        this.yVel += yAccel;

        // cap velocity
        if (this.xVel > terminalV) {
            this.xVel = terminalV;
        } else if (this.xVel < -terminalV) {
            this.xVel = -terminalV;
        }

        if (this.yVel > terminalV) {
            this.yVel = terminalV;
        } else if (this.yVel < -terminalV) {
            this.yVel = -terminalV;
        }

        // move the ball based on final accel values
        this.x += this.xVel;
        this.y += this.yVel;

        // bounce
        if (this.x < this.radius) {
            this.x = this.radius;
            this.xVel = Math.abs(this.xVel);
            this.xVel *= bounceFactor;
        } else if (this.x > canvas.width - this.radius) {
            this.x = canvas.width - this.radius;
            this.xVel = -Math.abs(this.xVel);
            this.xVel *= bounceFactor;
        }

        if (this.y > canvas.height - this.radius) {
            this.y = canvas.height - this.radius;
            this.yVel = -Math.abs(this.yVel);
            this.yVel *= bounceFactor;
        } else if (this.y < this.radius) {
            this.y = this.radius;
            this.yVel = Math.abs(this.yVel);
            this.yVel *= bounceFactor;
        }

        if (shouldDrawBalls) {
            this.draw();
        }
    }
}

const hzToIdx = (length, hz, sampleRate) => Math.floor(length * (hz / (sampleRate / 2)));

const drawMagnets = (frequencies, sampleRate) => {
    magnets.forEach((m, i) => {
        let dMag = 0;
        m.octaves.forEach(f => {
            freqIdx = hzToIdx(frequencies.length, parseInt(f), sampleRate);
            dMag += (frequencies[freqIdx] - 50) / m.octaves.length;
        });
        m.update(Math.max(0, dMag));
    });
};

const drawFilings = () => {
    filings.forEach(filing => {
        let xAccel = 0;
        let yAccel = 0;

        magnets.forEach(magnet => {
            a = magnet.x - filing.x;
            b = magnet.y - filing.y;
            c = Math.sqrt((a * a) + (b * b));
            if (c > (magnet.radius + filing.radius)) {
                xAngle = Math.asin(a / c);
                yAngle = Math.asin(b / c);
                xAccel += Math.sin(xAngle) * ((magnet.magnetism * magConstant * filing.charge) / (c * c));
                yAccel += Math.sin(yAngle) * ((magnet.magnetism * magConstant * filing.charge) / (c * c));
            }
        });

        filing.update(xAccel, yAccel);
    });
}

let magnets;
let filings;

const init = () => {
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    const gridCols = 4;
    const gridRows = 3;
    const xSpacing = canvas.width / gridCols + 1;
    const ySpacing = canvas.height / gridRows + 1;

    magnets = [];
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 4; j++) {
            magnets.push(new Magnet(
                (j * xSpacing) + (xSpacing / 2),
                (i * ySpacing) + (ySpacing / 2),
                twelveNotes[(i * 4) + j]
            ));
        }
    }

    filings = [];
    for (let i = 0; i < ballCount; i++) {
        filings.push(new Filing(Math.random() * canvas.width, Math.random() * canvas.height));
    }
}

init();