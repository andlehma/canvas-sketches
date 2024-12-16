const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

canvas.width = document.body.clientWidth;
canvas.height = document.body.clientHeight;

const gravity = 0.001;
const friction = 0.001;
const bounceFactor = 0.9;
const terminalV = 10;

const noteColors = {
    "A": 'blue',
    "A#": 'coral',
    "B": 'grey',
    "C": 'red',
    "C#": 'DarkTurquoise',
    "D": 'orange',
    "D#": 'DarkKhaki',
    "E": 'green',
    "F": 'yellow',
    "F#": 'GhostWhite',
    "G": 'magenta',
    "G#": 'RosyBrown'
};

const notes = {
    "A0": 27.50,
    "A#0": 29.14,
    "B0": 30.87,
    "C1": 32.70,
    "C#1": 34.65,
    "D1": 36.71,
    "D#1": 38.89,
    "E1": 41.20,
    "F1": 43.65,
    "F#1": 46.25,
    "G1": 49.00,
    "G#1": 51.91,
    "A1": 55.00,
    "A#1": 58.27,
    "B1": 61.74,
    "C2": 65.41,
    "C#2": 69.30,
    "D2": 73.42,
    "D#2": 77.78,
    "E2": 82.41,
    "F2": 87.31,
    "F#2": 92.50,
    "G2": 98.00,
    "G#2": 103.83,
    "A2": 110.00,
    "A#2": 116.54,
    "B2": 123.47,
    "C3": 130.81,
    "C#3": 138.59,
    "D3": 146.83,
    "D#3": 155.56,
    "E3": 164.81,
    "F3": 174.61,
    "F#3": 185.00,
    "G3": 196.00,
    "G#3": 207.65,
    "A3": 220.00,
    "A#3": 233.08,
    "B3": 246.94,
    "C4": 261.63,
    "C#4": 277.18,
    "D4": 293.66,
    "D#4": 311.13,
    "E4": 329.63,
    "F4": 349.23,
    "F#4": 369.99,
    "G4": 392.00,
    "G#4": 415.30,
    "A4": 440.00,
    "A#4": 466.16,
    "B4": 493.88,
    "C5": 523.25,
    "C#5": 554.37,
    "D5": 587.33,
    "D#5": 622.25,
    "E5": 659.26,
    "F5": 698.46,
    "F#5": 739.99,
    "G5": 783.99,
    "G#5": 830.61,
    "A5": 880.00,
    "A#5": 932.33,
    "B5": 987.77,
    "C6": 1046.50,
    "C#6": 1108.73,
    "D6": 1174.66,
    "D#6": 1244.51,
    "E6": 1318.51,
    "F6": 1396.91,
    "F#6": 1479.98,
    "G6": 1567.98,
    "G#6": 1661.22,
    "A6": 1760.00,
    "A#6": 1864.66,
    "B6": 1975.53,
    "C7": 2093.00,
    "C#7": 2217.46,
    "D7": 2349.32,
    "D#7": 2489.02,
    "E7": 2637.02,
    "F7": 2793.83,
    "F#7": 2959.96,
    "G7": 3135.96,
    "G#7": 3322.44,
    "A7": 3520.00,
    "A#7": 3729.31,
    "B7": 3951.07,
    "C8": 4186.01,
};

const noteWidth = canvas.width / Object.keys(notes).length;

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
            requestAnimationFrame(animate)
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            analyzer.getByteFrequencyData(frequencies);
            drawKeyboard(frequencies, audioCtx.sampleRate);
            drawNoteLine(frequencies, audioCtx.sampleRate);
            drawBalls(frequencies, audioCtx.sampleRate);
        }

        animate();
    });

class noteBall {
    constructor(name, freq) {
        this.freq = freq;

        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.xVel = (Math.random() * 5) - 2.5;
        this.yVel = 0;

        this.radius = 10;

        this.color = noteColors[name.slice(0, -1)];
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }

    update(xAccel, yAccel) {
        // static accelerations
        this.yVel += gravity;
        this.yVel = this.yVel * 1 - friction;
        this.xVel = this.xVel * 1 - friction;

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

        this.draw();
    }
}

const noteBalls = Object.entries(notes).map(([name, freq]) => new noteBall(name, freq));

const idxToHz = (length, i, sampleRate) => (i / length) * (sampleRate / 2);
const hzToIdx = (length, hz, sampleRate) => Math.floor(length * (hz / (sampleRate / 2)));

const drawKeyboard = (frequencies, sampleRate) => {
    Object.entries(notes).forEach(([name, freq], index) => {
        ctx.globalAlpha = 1;
        if (name.includes('#')) {
            ctx.fillStyle = 'black';
            ctx.fillRect(index * noteWidth, 0, noteWidth, canvas.height);
        } else {
            ctx.strokeStyle = 'black';
            ctx.strokeRect(index * noteWidth, 0, noteWidth, canvas.height);
        }

        idx = hzToIdx(frequencies.length, freq, sampleRate);
        ctx.globalAlpha = frequencies[idx] / 255;
        ctx.fillStyle = 'red';
        ctx.fillRect(index * noteWidth, 0, noteWidth, canvas.height);
    });
}

drawNoteLine = (frequencies, sampleRate) => {
    ctx.globalAlpha = 1;
    ctx.beginPath();
    Object.entries(notes).forEach(([name, freq], index) => {
        bigI = hzToIdx(frequencies.length, freq, sampleRate)
        ctx.lineTo((index * noteWidth) + (noteWidth / 2), getY(frequencies[bigI]));
    });

    ctx.strokeStyle = 'white';
    ctx.stroke();
}

const getY = freq => ((255 - freq) / 255) * canvas.height;

const drawBalls = (frequencies, sampleRate) => {
    noteBalls.forEach((b, i) => {
        bigI = hzToIdx(frequencies.length, b.freq, sampleRate);
        yAccel = -(Math.pow(frequencies[bigI], 2)) * .00001;
        xAccel = Math.sign(b.xVel) * Math.pow(frequencies[bigI], 2) * .00001;
        b.update(xAccel, yAccel);
    });
}
