// Browser: bundlers pick this file through the "browser" field in package.json.
// PNG is encoded in JavaScript (uncompressed deflate blocks); JPEG uses a <canvas> when there is one.

function base64(bytes) {
    let binary = '';
    for (let i = 0; i < bytes.length; i += 0x8000) {
        binary += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    }
    return btoa(binary);
}

function encodeJpeg(rgba, size) {
    if (typeof document === 'undefined') return null;
    try {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const context = canvas.getContext('2d');
        const image = context.createImageData(size, size);
        image.data.set(rgba);
        context.putImageData(image, 0, 0);
        const dataURL = canvas.toDataURL('image/jpeg', 0.9);
        if (!dataURL.startsWith('data:image/jpeg;base64,')) return null;
        const binary = atob(dataURL.split(',')[1]);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        return bytes;
    } catch (err) {
        return null;
    }
}

module.exports = { base64, deflate: null, jpeg: encodeJpeg };
