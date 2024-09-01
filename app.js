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

    // Extract masks from predictions (assuming the model outputs masks)
    const masks = predictions[0].arraySync();  // Adjust this index based on your model's output

    // Loop through each mask
    for (let i = 0; i < masks.length; i++) {
        const mask = masks[i]; // Get the current mask for furniture detection

        // Apply the wallpaper only where the mask indicates wall area (assuming mask is binary)
        for (let y = 0; y < mask.length; y++) {
            for (let x = 0; x < mask[y].length; x++) {
                if (mask[y][x] === 0) { // Assuming 0 indicates wall area, adjust if necessary
                    ctx.drawImage(
                        wallpaperImage,
                        0, 0,
                        wallpaperImage.width,
                        wallpaperImage.height,
                        x * wallImage.width / mask[0].length,
                        y * wallImage.height / mask.length,
                        wallImage.width / mask[0].length,
                        wallImage.height / mask.length
                    );
                }
            }
        }
    }

    // Clean up tensors to free memory
    tensor.dispose();
}
