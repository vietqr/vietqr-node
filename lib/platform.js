// Node.js: zlib for PNG compression, jpeg-js (pure JavaScript) for JPEG, https for the bank list.
const https = require('https');
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

const TIMEOUT = 10000;

// GET a JSON body. Non-2xx responses reject with an error carrying `response`, like axios did.
function getJSON(url, redirects = 5) {
    return new Promise((resolve, reject) => {
        const req = https.get(url, { headers: { Accept: 'application/json' } }, (res) => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location && redirects > 0) {
                res.resume();
                resolve(getJSON(new URL(res.headers.location, url).toString(), redirects - 1));
                return;
            }
            const chunks = [];
            res.on('data', (c) => chunks.push(c));
            res.on('error', reject);
            res.on('end', () => {
                const text = Buffer.concat(chunks).toString('utf8');
                let data = text;
                try {
                    data = JSON.parse(text);
                } catch (err) {
                    // keep the raw text
                }
                if (res.statusCode >= 200 && res.statusCode < 300) return resolve(data);
                const err = new Error(`Request failed with status code ${res.statusCode}`);
                err.response = { status: res.statusCode, statusText: res.statusMessage, headers: res.headers, data };
                reject(err);
            });
        });
        req.setTimeout(TIMEOUT, () => req.destroy(new Error(`timeout after ${TIMEOUT} ms`)));
        req.on('error', reject);
    });
}

module.exports = { base64, deflate, jpeg: encodeJpeg, getJSON };
