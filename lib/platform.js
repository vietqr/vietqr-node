// Node.js: zlib for PNG compression, jpeg-js (pure JavaScript) for JPEG.
const zlib = require('zlib');
const jpeg = require('jpeg-js');

function base64(bytes) {
    return Buffer.from(bytes.buffer, bytes.byteOffset, bytes.byteLength).toString('base64');
}

function deflate(bytes) {
    return zlib.deflateSync(bytes, { level: 9 });
}

function encodeJpeg(rgba, size) {
    return jpeg.encode({ data: rgba, width: size, height: size }, 90).data;
}

module.exports = { base64, deflate, jpeg: encodeJpeg };
