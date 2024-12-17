window.onload = function () {
	var input = document.getElementById('image-input');
	input.addEventListener('change', handleFiles);
}

function handleFiles(e) {
	const canvas = document.querySelector('canvas');
	const ctx = canvas.getContext('2d'); 


	const img = new Image;

	img.onload = function () {
		const imgW = 1000;
		const imgH = imgW * img.height / img.width;
		canvas.width = imgW;
		canvas.height = imgH;

		ctx.drawImage(img, 0, 0, imgW, imgH);

		dither(canvas, ctx);
	}

	img.src = URL.createObjectURL(e.target.files[0]);
}