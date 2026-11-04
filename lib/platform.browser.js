// Browser: bundlers pick this file through the "browser" field in package.json.
// PNG is encoded in JavaScript (uncompressed deflate blocks); JPEG uses a <canvas> when there is one;
// the bank list is fetched with fetch().

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

const TIMEOUT = 2000;

// GET a JSON body. Non-2xx responses reject with an error carrying `response`, like axios did.
function getJSON(url) {
    const controller = typeof AbortController === 'function' ? new AbortController() : null;
    const timer = controller ? setTimeout(() => controller.abort(), TIMEOUT) : null;
    const done = () => timer && clearTimeout(timer);
    return fetch(url, { headers: { Accept: 'application/json' }, signal: controller ? controller.signal : undefined }).then((res) => res.text().then((text) => {
        let data = text;
        try {
            data = JSON.parse(text);
        } catch (err) {
            // keep the raw text
        }
        if (res.ok) return data;
        const err = new Error(`Request failed with status code ${res.status}`);
        err.response = { status: res.status, statusText: res.statusText, headers: {}, data };
        throw err;
    })).then((data) => {
        done();
        return data;
    }, (err) => {
        done();
        throw err;
    });
}

module.exports = { base64, deflate: null, jpeg: encodeJpeg, getJSON };
