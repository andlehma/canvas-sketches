// TODO: scaling
// TODO: draw the original next to the dithered
const bayer16 = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]];

const bayer = bayer16.map((row, _, arr) => row.map(x => x / (arr.length * row.length)));
const bayerHeight = bayer.length;
const bayerWidth = bayer[0].length;

const dither = (canvas, ctx) => {
	const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
	let data = imageData.data;

	const pixelArr = dataToGrayscalePixels(data, canvas.width);

	for (let row = 0; row < pixelArr.length; row++) {
		for (let col = 0; col < pixelArr[row].length; col++) {
			pixelArr[row][col] = pixelArr[row][col] > bayer[row % bayerHeight][col % bayerWidth] * 255 ? 255 : 0;
		}
	}

	const d = pixelsToData(pixelArr);
	for (let i = 0; i < imageData.data.length; i++) {
		imageData.data[i] = d[i];
	}

	ctx.putImageData(imageData, 0, 0);
}

const dataToGrayscalePixels = (data, width) => {
	const chunkSize = width * 4;
	const rows = _.chunk(data, chunkSize);
	const pixels = rows.map(row => _.chunk(row, 4));
	const gray = pixels.map(row => row.map(pixel => (
		(pixel[0] * 0.3) +
		(pixel[1] * 0.59) +
		(pixel[2] * 0.11)
	)));
	return gray;
}

const pixelsToData = (pixels) => {
	// TODO: allow for colors other than b/w
	return _.flatMap(_.flatten(pixels), p => [p, p, p, 255]);
}
