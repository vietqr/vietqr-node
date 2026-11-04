let axios = require("axios");
const { generate } = require("./lib/generate");
const { genQRText } = require("./lib/payload");
const { BANKS, findBank } = require("./lib/banks");
const { warnOnce } = require("./lib/warn");
// Root themes and Quick Link syntax from https://www.vietqr.io/qr-dong.md
const QUICK_LINK = 'https://img.vietqr.io/image';
const DEMO_QUERY = 'amount=790000&addInfo=dong%20qop%20quy%20vac%20xin&accountName=Quy%20Vac%20Xin%20Covid';
const TEMPLATES = [
    { name: 'Compact 2', template: 'compact2', size: '540x640' },
    { name: 'Compact', template: 'compact', size: '540x540' },
    { name: 'QR Only', template: 'qr_only', size: '480x480' },
    { name: 'Print', template: 'print', size: '600x776' },
    { name: 'Loax', template: 'loax', size: '2583x3719' },
].map((t) => Object.assign(t, { demo: `${QUICK_LINK}/vietinbank-113366668888-${t.template}.svg?${DEMO_QUERY}` }));

class VietQR {
    // clientID / apiKey are no longer needed; they are still accepted so existing code keeps working.
    constructor({
        clientID = '',
        apiKey = '',

    } = {}) {
        if (clientID || apiKey) {
            warnOnce('keys', 'clientID / apiKey are no longer needed and are ignored. You can use `new VietQR()`.');
        }
        this.clientID = clientID;
        this.apiKey = apiKey;
        this.apiUrl = 'https://api.vietqr.io';
    }

    // Kept for callers of the old API; keys are never required now.
    checkKey() {
        return true
    }

    sendMessage() {}

    // Offline: the root themes listed in the Quick Link docs, in the old /v2/template response shape.
    async getTemplate() {
        return { code: '00', desc: 'success', data: TEMPLATES.map((t) => Object.assign({}, t)) };
    }

    async getBanks() {
        return await getData(`${this.apiUrl}/v2/banks`);
    }

    // Generated offline (no request to /v2/generate) as a plain QR code; template images come from genQuickLink().
    // The result keeps the axios response shape of earlier versions, so `res.data.data.qrDataURL` keeps working.
    async genQRCodeBase64({
        bank = '',
        accountName = '',
        accountNumber = '',
        amount = '',
        memo = '',
        template = 'qr_only',
        media = 'png',
    }) {
        return await generateResponse({
            accountNo: accountNumber,
            accountName: accountName,
            acqId: bank,
            addInfo: memo,
            amount: amount,
            template: template,
            media: media,
        });
    }

    async genQRCodeBase64V1({
        bank = '',
        accountName = '',
        accountNumber = '',
        amount = '',
        memo = '',
        format = 'qr_only',
        media = 'png',
    }) {
        return await generateResponse({
            accountNo: accountNumber,
            accountName: accountName,
            acqId: bank,
            addInfo: memo,
            amount: amount,
            format: format,
            media: media,
        });
    }
    genQuickLink({
        bank = '',
        accountName = '',
        accountNumber = '',
        amount = '',
        memo = '',
        template = 'qr_only',
        media = ''
    }) {
        // Quick Link syntax from https://www.vietqr.io/qr-dong.md. `media` keeps its old meaning
        // ('.jpg' or default '.png'); '.svg' is accepted too.
        const ext = media == '.jpg' ? 'jpg' : media == '.svg' ? 'svg' : 'png';
        const query = [['amount', amount], ['addInfo', memo], ['accountName', accountName]]
            .filter(([, value]) => value !== undefined && value !== null && value !== '')
            .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
            .join('&');
        const path = [bank, accountNumber, template].map((part) => encodeURIComponent(part)).join('-');
        return `${QUICK_LINK}/${path}.${ext}${query ? `?${query}` : ''}`;
    }
    // The VietQR payment gateway has been retired. The method stays so callers do not crash:
    // like a failed request in earlier versions, it logs and resolves to an Error.
    async createPaymentGateway() {
        const err = new Error('vietqr: createPaymentGateway() is no longer supported, the VietQR payment gateway has been retired.');
        warnOnce('gateway', 'createPaymentGateway() is no longer supported: the VietQR payment gateway has been retired. It now resolves to an Error without making a request.');
        return err
    }
}

async function getData(url) {
    return await axios.get(url)
        .then(data => {
            return data.data
        })
        .catch(err => {
            console.log(err);
            return err
        })
}

async function generateResponse(body) {
    try {
        const data = await generate(body);
        return { data: data, status: 200, statusText: 'OK', headers: {}, config: {} };
    } catch (err) {
        console.log(err);
        return err
    }
}

module.exports.VietQR = VietQR
module.exports.generateQR = generate
module.exports.genQRText = genQRText
module.exports.BANKS = BANKS
module.exports.findBank = findBank
