async function loadModel() {
    model = await tf.loadGraphModel('tfjs_model/model.json');
    console.log('Model loaded');
}
loadModel();

async function processImages() {
    const wallUpload = document.getElementById('wallUpload').files[0];
    const wallpaperUpload = document.getElementById('wallpaperUpload').files[0];

    if (!wallUpload || !wallpaperUpload) {
        alert("Please upload both wall and wallpaper images.");
        return;
    }

    const wallImage = await loadImage(wallUpload);
    const wallpaperImage = await loadImage(wallpaperUpload);

    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = wallImage.width;
    canvas.height = wallImage.height;

    ctx.drawImage(wallImage, 0, 0);

    const tensor = tf.browser.fromPixels(wallImage).expandDims(0);
    const predictions = await model.executeAsync(tensor);

    const boxes = predictions[0].arraySync();
    const classes = predictions[1].arraySync();

    ctx.drawImage(wallpaperImage, 0, 0, wallImage.width, wallImage.height);

    for (let i = 0; i < boxes.length; i++) {
        const [y1, x1, y2, x2] = boxes[i];
        const width = x2 - x1;
        const height = y2 - y1;
        ctx.drawImage(wallImage, x1, y1, width, height, x1, y1, width, height);
    }
}

async function loadImage(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.src = e.target.result;
            img.onload = () => resolve(img);
        };
        reader.readAsDataURL(file);
    });
}