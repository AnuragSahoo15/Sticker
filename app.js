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

    // Draw the original wall image on the canvas
    ctx.drawImage(wallImage, 0, 0);

    // Prepare the image tensor for the model
    const tensor = tf.browser.fromPixels(wallImage).expandDims(0);

    // Get predictions from the model
    const predictions = await model.executeAsync(tensor);

    // Extract boxes and classes from predictions
    const boxes = predictions[0].arraySync();  // Assuming this contains bounding boxes
    const classes = predictions[1].arraySync();  // Assuming this contains class labels

    // Loop through each detection
    for (let i = 0; i < boxes.length; i++) {
        const [y1, x1, y2, x2] = boxes[i];  // Assuming boxes are in [y1, x1, y2, x2] format

        // Calculate the width and height of the box
        const width = x2 - x1;
        const height = y2 - y1;

        // Draw the wallpaper image only within the detected box region
        ctx.drawImage(
            wallpaperImage,        // Image to draw
            0, 0,                  // Source x, y in the wallpaper image
            wallpaperImage.width,  // Source width in the wallpaper image
            wallpaperImage.height, // Source height in the wallpaper image
            x1 * wallImage.width,  // Destination x in the canvas, scaled to canvas size
            y1 * wallImage.height, // Destination y in the canvas, scaled to canvas size
            width * wallImage.width,  // Destination width in the canvas, scaled to canvas size
            height * wallImage.height  // Destination height in the canvas, scaled to canvas size
        );
    }

    // Clean up tensors to free memory
    tensor.dispose();
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
