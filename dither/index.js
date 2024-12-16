const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d', { willReadFrequently: true });
const attributes = ctx.getContextAttributes();

canvas.width = 500;
canvas.height = 500;

let ballX = Math.random() * canvas.width;
let ballY = Math.random() * canvas.height;
let ballXVel = Math.random() * 3;
let ballYVel = Math.random() * 3;
let ballRadiusVel = 1;

let ballRadius = 80;

const bayer = [[0,  8,  2,  10], [12, 4,  14, 6], [3,  11, 1,  9], [15, 7,  13, 5]];

const animate = (fps) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setTimeout(() => {
        requestAnimationFrame(animate);
    }, 1000 / fps);

    ballX += ballXVel;
    ballY += ballYVel;
    ballRadius += ballRadiusVel;

    if (ballX > canvas.width - ballRadius) {
        ballXVel = -Math.abs(ballXVel);
    }

    if (ballX < ballRadius) {
        ballXVel = Math.abs(ballXVel);
    }

    if (ballY > canvas.height - ballRadius) {
        ballYVel = -Math.abs(ballYVel);
    }

    if (ballY < ballRadius) {
        ballYVel = Math.abs(ballYVel);
    }

    if (ballRadius > 120) {
        ballRadiusVel = -1;
    }

    if (ballRadius < 10) {
        ballRadiusVel = 1;
    }

    drawBall();

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let data = imageData.data;

    const pixelArr = dataToGrayscalePixels(data, canvas.width);

    const bayerSize = bayer.length;
    for (let i = 0; i < pixelArr.length; i++) {
        for (let j = 0; j < pixelArr[i].length; j++) {
            pixelArr[i][j] = pixelArr[i][j] / 16 > bayer[i % bayerSize][j % bayerSize] ? 255 : 0;
        }
    }

    const d = pixelsToData(pixelArr);
    for (let i = 0; i < imageData.data.length; i++) {
        imageData.data[i] = d[i];
    }

    ctx.putImageData(imageData, 0, 0);
}

const dataToGrayscalePixels = (data, width) => {
    const chunkSize = data.length / width;
    const rows = _.chunk(data, chunkSize);
    const pixels = rows.map(row => _.chunk(row, 4));
    const gray = pixels.map(row => row.map(pixel => (pixel[0] + pixel[1] + pixel[2]) / 3));
    return gray;
}

const pixelsToData = (pixels) => {
    return _.flatMap(_.flatten(pixels), p => [p, p, p, 255]);
}

let greyValue = 128;

const drawBall = () => {
    const grad = ctx.createRadialGradient(ballX, ballY, 1, ballX, ballY, ballRadius);
    grad.addColorStop(0, `rgb(${greyValue}, ${greyValue}, ${greyValue})`);
    grad.addColorStop(1, "black");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

var slider = document.querySelector("input");

slider.oninput = function() {
    greyValue = parseInt(this.value);
}

animate(12);