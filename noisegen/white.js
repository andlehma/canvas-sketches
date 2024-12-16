const canvas = document.querySelector('#white-noise');
const ctx = canvas.getContext('2d');

draw = () => {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    for (var i = 0; i < data.length; i += 4) {
        const greyVal = Math.random() * 255;
        data[i] = greyVal;
        data[i + 1] = greyVal;
        data[i + 2] = greyVal;
        data[i + 3] = 255
    }
    ctx.putImageData(imageData, 0, 0);
}

draw();