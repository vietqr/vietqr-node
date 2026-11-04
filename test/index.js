const assert = require('node:assert/strict');
const { describe, it } = require('node:test');
const jsQR = require('jsqr');
const { PNG } = require('pngjs');
const jpeg = require('jpeg-js');
const { VietQR, generateQR, genQRText, findBank } = require('../index.js');

// Payloads decoded from real api.vietqr.io / img.vietqr.io images.
const ORIGIN = [
    { bank: 'vietinbank', accountNo: '113366668888', amount: 790000, addInfo: 'dong qop quy vac xin', qr: '00020101021238560010A0000007270126000697041501121133666688880208QRIBFTTA530370454067900005802VN62240820dong qop quy vac xin6304528C' },
    { bank: 'vcb', accountNo: '0011002299881', qr: '00020101021138570010A00000072701270006970436011300110022998810208QRIBFTTA53037045802VN63047B43' },
    { bank: 'mbbank', accountNo: '0123456789', amount: 10000, qr: '00020101021238540010A00000072701240006970422011001234567890208QRIBFTTA53037045405100005802VN630440A9' },
    { bank: 'acb', accountNo: '123456789', amount: 150000, addInfo: 'thanh toan', qr: '00020101021238530010A0000007270123000697041601091234567890208QRIBFTTA530370454061500005802VN62140810thanh toan6304565D' },
    { bank: 'vcb', accountNo: '0011002299881', amount: 50000, qr: '00020101021238570010A00000072701270006970436011300110022998810208QRIBFTTA53037045405500005802VN63044A1C' },
    { bank: '970415', accountNo: '113366668888', qr: '00020101021138560010A0000007270126000697041501121133666688880208QRIBFTTA53037045802VN6304F443' },
    { bank: 'tcb', accountNo: '1903456789012', amount: 9999999999999, qr: '00020101021238570010A00000072701270006970407011319034567890120208QRIBFTTA5303704541399999999999995802VN630485F9' },
    { bank: 'bidv', accountNo: '1234567890123', qr: '00020101021138570010A00000072701270006970418011312345678901230208QRIBFTTA53037045802VN6304C0A4' },
    { bank: 'momo', accountNo: '0123456789', qr: '00020101021138540010A00000072701240006971025011001234567890208QRIBFTTA53037045802VN63043846' },
    { bank: 'vcb', accountNo: '123', amount: 1, qr: '00020101021238470010A0000007270117000697043601031230208QRIBFTTA5303704540115802VN6304B1B3' },
    { bank: 'vcb', accountNo: '1', qr: '00020101021138450010A00000072701150006970436010110208QRIBFTTA53037045802VN6304643B' },
];

function decodePng(dataURL) {
    assert.match(dataURL, /^data:image\/png;base64,/);
    return scan(PNG.sync.read(Buffer.from(dataURL.split(',')[1], 'base64')));
}

function decodeJpeg(dataURL) {
    assert.match(dataURL, /^data:image\/jpeg;base64,/);
    return scan(jpeg.decode(Buffer.from(dataURL.split(',')[1], 'base64'), { useTArray: true }));
}

function scan(image) {
    const code = jsQR(new Uint8ClampedArray(image.data), image.width, image.height);
    return { width: image.width, height: image.height, text: code && code.data };
}

const SAMPLE = {
    bank: '970415',
    accountName: 'QUY VAC XIN PHONG CHONG COVID',
    accountNumber: '113366668888',
    amount: '79000',
    memo: 'Ung Ho Quy Vac Xin',
};

describe('payload', () => {
    for (const c of ORIGIN) {
        it(`matches origin ${c.bank} ${c.accountNo}`, () => {
            const acqId = findBank(c.bank).bin;
            assert.equal(genQRText({ acqId, accountNo: c.accountNo, amount: c.amount, addInfo: c.addInfo }), c.qr);
        });
    }
});

describe('genQRCodeBase64 (offline, same shape as the old axios response)', () => {
    const vietQR = new VietQR({ clientID: 'any', apiKey: 'any' });

    it('draws a plain, scannable PNG QR', async () => {
        const res = await vietQR.genQRCodeBase64(Object.assign({}, SAMPLE, { template: 'qr_only' }));
        assert.equal(res.status, 200);
        assert.equal(res.data.code, '00');
        assert.equal(res.data.desc, 'Gen VietQR successful!');
        assert.equal(res.data.data.acqId, '970415');
        assert.equal(res.data.data.accountName, 'QUY VAC XIN PHONG CHONG COVID');
        const decoded = decodePng(res.data.data.qrDataURL);
        assert.equal(decoded.width, decoded.height);
        assert.ok(decoded.width >= 400 && decoded.width <= 560, `width ${decoded.width}`);
        assert.equal(decoded.text, res.data.data.qrCode);
        assert.match(res.data.data.qrCode, /62220818Ung Ho Quy Vac Xin6304/);
    });

    it('works without API keys and defaults to qr_only', async () => {
        const res = await new VietQR({}).genQRCodeBase64(SAMPLE);
        assert.equal(res.data.code, '00');
        assert.equal(decodePng(res.data.data.qrDataURL).text, res.data.data.qrCode);
    });

    for (const template of ['compact', 'compact2', 'print', 'loax', 'my-custom-slug']) {
        it(`template ${template} is not drawn offline: same plain QR`, async () => {
            const plain = await vietQR.genQRCodeBase64(SAMPLE);
            const res = await vietQR.genQRCodeBase64(Object.assign({}, SAMPLE, { template }));
            assert.equal(res.data.code, '00');
            assert.equal(res.data.data.qrDataURL, plain.data.data.qrDataURL);
        });
    }

    it('V1 uses format and the same offline generator', async () => {
        const res = await vietQR.genQRCodeBase64V1(Object.assign({}, SAMPLE, { format: 'compact2' }));
        assert.equal(decodePng(res.data.data.qrDataURL).text, res.data.data.qrCode);
    });

    it('banks outside the snapshot still work with a 6-digit BIN', async () => {
        const res = await vietQR.genQRCodeBase64(Object.assign({}, SAMPLE, { bank: '123456' }));
        assert.equal(decodePng(res.data.data.qrDataURL).text, res.data.data.qrCode);
    });

    for (const media of ['jpg', 'jpeg', '.jpg']) {
        it(`media ${media} returns a scannable JPEG`, async () => {
            const res = await vietQR.genQRCodeBase64(Object.assign({}, SAMPLE, { media }));
            assert.equal(decodeJpeg(res.data.data.qrDataURL).text, res.data.data.qrCode);
        });
    }

    it('media svg returns a plain SVG QR', async () => {
        const res = await vietQR.genQRCodeBase64(Object.assign({}, SAMPLE, { template: 'compact2', media: 'svg' }));
        assert.match(res.data.data.qrDataURL, /^data:image\/svg\+xml;base64,/);
        const svg = Buffer.from(res.data.data.qrDataURL.split(',')[1], 'base64').toString();
        assert.doesNotMatch(svg, /<image|<text/);
    });

    it('browser build: uncompressed PNG still decodes', () => {
        const { qrDataURL } = require('../lib/image');
        const browser = require('../lib/platform.browser');
        const text = genQRText({ acqId: '970415', accountNo: '113366668888', amount: 79000, addInfo: 'Ung ho' });
        assert.equal(decodePng(qrDataURL(text, 'png', browser)).text, text);
    });

    it('template text returns only the payload', async () => {
        const res = await vietQR.genQRCodeBase64(Object.assign({}, SAMPLE, { template: 'text' }));
        assert.equal(res.data.data.qrDataURL, null);
        assert.ok(res.data.data.qrCode.startsWith('000201'));
    });

    it('media svg returns an SVG data URL', async () => {
        const res = await vietQR.genQRCodeBase64(Object.assign({}, SAMPLE, { template: 'compact2', media: 'svg' }));
        assert.match(res.data.data.qrDataURL, /^data:image\/svg\+xml;base64,/);
    });

    it('normalizes Vietnamese input like the API', async () => {
        const res = await vietQR.genQRCodeBase64(Object.assign({}, SAMPLE, { accountName: 'Nguyễn Văn Đức 123', memo: 'Thanh toán đơn #42!' }));
        assert.equal(res.data.data.accountName, 'NGUYEN VAN DUC');
        assert.match(res.data.data.qrCode, /0817Thanh toan don 426304/);
    });

    it('accepts a bank code instead of the BIN', async () => {
        const res = await vietQR.genQRCodeBase64(Object.assign({}, SAMPLE, { bank: 'ICB' }));
        assert.equal(res.data.data.acqId, '970415');
    });
});

describe('validation codes match the API', () => {
    const cases = [
        [{}, '01'],
        [{ acqId: '970415', accountName: 'NGUYEN VAN A' }, '11'],
        [{ accountNo: '12', acqId: '970415', accountName: 'NGUYEN VAN A' }, '21'],
        [{ accountNo: '123456', accountName: 'NGUYEN VAN A' }, '12'],
        [{ accountNo: '123456', acqId: '97041', accountName: 'NGUYEN VAN A' }, '22'],
        [{ accountNo: '123456', acqId: '970415' }, '13'],
        [{ accountNo: '123456', acqId: '970415', accountName: 'AB' }, '23'],
        [{ accountNo: '123456', acqId: '970415', accountName: 'NGUYEN VAN A', amount: '10.000' }, '24'],
    ];
    for (const [body, code] of cases) {
        it(`code ${code}`, async () => {
            const res = await generateQR(body);
            assert.equal(res.code, code);
            assert.equal(res.data, undefined);
        });
    }
});

describe('genQuickLink uses the img.vietqr.io Quick Link syntax', () => {
    const vietQR = new VietQR();

    it('keeps media .jpg', () => {
        const link = vietQR.genQuickLink(Object.assign({}, SAMPLE, { template: 'compact', media: '.jpg' }));
        assert.equal(link, 'https://img.vietqr.io/image/970415-113366668888-compact.jpg?amount=79000&addInfo=Ung%20Ho%20Quy%20Vac%20Xin&accountName=QUY%20VAC%20XIN%20PHONG%20CHONG%20COVID');
    });

    it('defaults to qr_only .png and skips empty fields', () => {
        assert.equal(vietQR.genQuickLink({ bank: 'vietinbank', accountNumber: '113366668888' }), 'https://img.vietqr.io/image/vietinbank-113366668888-qr_only.png');
    });

    it('supports .svg and encodes Vietnamese text', () => {
        const link = vietQR.genQuickLink({ bank: 'ICB', accountNumber: '113366668888', amount: 790000, memo: 'đóng quỹ & vắc xin', template: 'compact2', media: '.svg' });
        assert.equal(link, 'https://img.vietqr.io/image/ICB-113366668888-compact2.svg?amount=790000&addInfo=%C4%91%C3%B3ng%20qu%E1%BB%B9%20%26%20v%E1%BA%AFc%20xin');
    });
});

describe('no API keys, no template / gateway API', () => {
    it('constructs without options', () => {
        assert.ok(new VietQR());
    });

    it('getTemplate is offline and keeps the old shape', async () => {
        const res = await new VietQR().getTemplate();
        assert.equal(res.code, '00');
        assert.deepEqual(res.data.map((t) => t.template), ['compact2', 'compact', 'qr_only', 'print', 'loax']);
        assert.equal(res.data[0].demo, 'https://img.vietqr.io/image/vietinbank-113366668888-compact2.svg?amount=790000&addInfo=dong%20qop%20quy%20vac%20xin&accountName=Quy%20Vac%20Xin%20Covid');
        assert.ok(res.data.every((t) => t.name && t.size));
    });

    it('createPaymentGateway resolves to an Error without a request', async () => {
        const res = await new VietQR().createPaymentGateway({ theme_slug: 'x' });
        assert.ok(res instanceof Error);
    });

    it('getBanks falls back to the offline list when the API is unreachable', async () => {
        const vietQR = new VietQR();
        vietQR.apiUrl = 'https://127.0.0.1:9';
        const res = await vietQR.getBanks();
        assert.equal(res.code, '00');
        assert.equal(res.desc, `Get Bank list successful! Total ${res.data.length} banks`);
        const icb = res.data.find((b) => b.code === 'ICB');
        assert.equal(icb.bin, '970415');
        assert.ok(icb.shortName && icb.logo && 'transferSupported' in icb);
        icb.bin = 'changed';
        assert.equal(findBank('ICB').bin, '970415');
    });

    it('genQuickLink no longer needs keys', () => {
        assert.match(new VietQR().genQuickLink(SAMPLE), /^https:\/\/img\.vietqr\.io\/image\/970415-/);
    });
});
