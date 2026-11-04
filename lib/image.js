// Plain QR code images (modules and quiet zone only): SVG, PNG and JPEG data URLs.
const qrcodegen = require('./qrcodegen');
const { warnOnce } = require('./warn');

const BORDER = 4; // quiet zone, in modules
const TARGET_SIZE = 480; // approximate image width in pixels

function encode(payload) {
    const qr = qrcodegen.QrCode.encodeText(payload, qrcodegen.QrCode.Ecc.MEDIUM);
    const modules = qr.size + BORDER * 2;
    const scale = Math.max(1, Math.round(TARGET_SIZE / modules));
    return {
        modules,
        size: modules * scale,
        // true when the pixel (x, y) is dark
        dark: (x, y) => qr.getModule(Math.floor(x / scale) - BORDER, Math.floor(y / scale) - BORDER),
        module: (x, y) => qr.getModule(x - BORDER, y - BORDER),
    };
}

function toSvg(qr) {
    const parts = [];
    for (let y = 0; y < qr.modules; y++) {
        let x = 0;
        while (x < qr.modules) {
            if (!qr.module(x, y)) {
                x++;
                continue;
            }
            const x0 = x;
            while (x < qr.modules && qr.module(x, y)) x++;
            parts.push(`M${x0} ${y}h${x - x0}v1h-${x - x0}z`);
        }
    }
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${qr.size}" height="${qr.size}" viewBox="0 0 ${qr.modules} ${qr.modules}" shape-rendering="crispEdges">` +
        `<rect width="${qr.modules}" height="${qr.modules}" fill="#ffffff"/><path fill="#000000" d="${parts.join('')}"/></svg>`;
}

// 1-bit grayscale PNG. `deflate` compresses the zlib stream; without it, stored (uncompressed) blocks are used.
function toPng(qr, deflate) {
    const stride = Math.ceil(qr.size / 8) + 1;
    const raw = new Uint8Array(stride * qr.size);
    for (let y = 0; y < qr.size; y++) {
        const row = y * stride;
        for (let x = 0; x < qr.size; x++) {
            if (!qr.dark(x, y)) raw[row + 1 + (x >> 3)] |= 0x80 >> (x & 7);
        }
    }
    const header = new Uint8Array(13);
    writeUint32(header, 0, qr.size);
    writeUint32(header, 4, qr.size);
    header.set([1, 0, 0, 0, 0], 8); // bit depth 1, grayscale, deflate, no filter, no interlace
    return concat([
        new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
        chunk('IHDR', header),
        chunk('IDAT', deflate ? new Uint8Array(deflate(raw)) : storedZlib(raw)),
        chunk('IEND', new Uint8Array(0)),
    ]);
}

// RGBA pixels, for encoders that take a full-color bitmap (JPEG).
function toRgba(qr) {
    const rgba = new Uint8Array(qr.size * qr.size * 4);
    for (let y = 0; y < qr.size; y++) {
        for (let x = 0; x < qr.size; x++) {
            const i = (y * qr.size + x) * 4;
            const value = qr.dark(x, y) ? 0 : 255;
            rgba[i] = rgba[i + 1] = rgba[i + 2] = value;
            rgba[i + 3] = 255;
        }
    }
    return rgba;
}

// media: 'png' (default), 'jpg' / 'jpeg' or 'svg'; a leading dot is accepted ('.jpg').
// platform: { base64(bytes), deflate?(bytes), jpeg?(rgba, size) -> bytes | null }
function qrDataURL(payload, media, platform) {
    const type = String(media || 'png').replace(/^\./, '').toLowerCase();
    const qr = encode(payload);
    if (type === 'svg') {
        return `data:image/svg+xml;base64,${platform.base64(new TextEncoder().encode(toSvg(qr)))}`;
    }
    if (type === 'jpg' || type === 'jpeg') {
        const jpeg = platform.jpeg ? platform.jpeg(toRgba(qr), qr.size) : null;
        if (jpeg) return `data:image/jpeg;base64,${platform.base64(jpeg)}`;
        warnOnce('jpeg', 'JPEG is not available in this environment, qrDataURL is a PNG instead.');
    }
    return `data:image/png;base64,${platform.base64(toPng(qr, platform.deflate))}`;
}

function storedZlib(data) {
    const blocks = [new Uint8Array([0x78, 0x01])];
    for (let i = 0; i < data.length || i === 0; i += 0xffff) {
        const part = data.subarray(i, i + 0xffff);
        const last = i + 0xffff >= data.length ? 1 : 0;
        blocks.push(new Uint8Array([last, part.length & 0xff, part.length >> 8, ~part.length & 0xff, (~part.length >> 8) & 0xff]), part);
    }
    let a = 1;
    let b = 0;
    for (let i = 0; i < data.length; i++) {
        a = (a + data[i]) % 65521;
        b = (b + a) % 65521;
    }
    const adler = new Uint8Array(4);
    writeUint32(adler, 0, ((b << 16) | a) >>> 0);
    blocks.push(adler);
    return concat(blocks);
}

const CRC_TABLE = (() => {
    const table = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
        let c = n;
        for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
        table[n] = c >>> 0;
    }
    return table;
})();

function chunk(type, data) {
    const out = new Uint8Array(12 + data.length);
    writeUint32(out, 0, data.length);
    for (let i = 0; i < 4; i++) out[4 + i] = type.charCodeAt(i);
    out.set(data, 8);
    let crc = 0xffffffff;
    for (let i = 4; i < 8 + data.length; i++) crc = CRC_TABLE[(crc ^ out[i]) & 0xff] ^ (crc >>> 8);
    writeUint32(out, 8 + data.length, (crc ^ 0xffffffff) >>> 0);
    return out;
}

function writeUint32(buf, offset, value) {
    buf[offset] = value >>> 24;
    buf[offset + 1] = (value >>> 16) & 0xff;
    buf[offset + 2] = (value >>> 8) & 0xff;
    buf[offset + 3] = value & 0xff;
}

function concat(parts) {
    const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
    let offset = 0;
    for (const part of parts) {
        out.set(part, offset);
        offset += part.length;
    }
    return out;
}

module.exports = { qrDataURL };
