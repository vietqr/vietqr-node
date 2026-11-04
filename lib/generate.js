// Offline replacement for POST https://api.vietqr.io/v2/generate.
// Validation, codes and messages follow the api.vietqr.io response so callers see the same body.
// Only plain QR images are drawn offline; template images are served by img.vietqr.io (genQuickLink).
const { genQRText } = require('./payload');
const { findBank } = require('./banks');
const { qrDataURL } = require('./image');
const platform = require('./platform');
const { warnOnce } = require('./warn');

const ERRORS = {
    MISSING_ALL_PARAM: ['01', 'Thông tin truyền lên không đúng.'],
    MISSING_ACCOUNTNO: ['11', 'Missing accountNo!'],
    MISSING_ACQID: ['12', 'Missing ACQID!'],
    MISSING_ACCOUNTNAME: ['13', 'Missing accountName!'],
    INVALID_ACCOUNTNO: ['21', 'Invalid accountNo - số tài khoản thụ hưởng nhập số hoặc chữ(alias, nickname), tối thiểu 4 ký tự, tối đa 25 kí tự'],
    INVALID_ACQID: ['22', 'Invalid acqId - Mã định danh ngân hàng (thường gọi là BIN) 6 chữ số, quy đinh bởi ngân hàng nước. Xem BIN tại https://api.vietqr.io/v2/banks '],
    INVALID_ACCOUNTNAME: ['23', 'Invalid accountName - Tên tài khoản là tiếng Việt không dấu, viết hoa, tối thiểu 5 ký tự, tối đa 50 kí tự, không chứa các ký tự đặc biệt.'],
    INVALID_AMOUNT: ['24', 'Invalid amount - Trường chỉ nhập số, tối đa 13 kí tự'],
};

function fail(key) {
    const [code, desc] = ERRORS[key];
    return { code, desc };
}

function removeVietnameseTones(value) {
    return value.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');
}

function removeSpecialChars(value) {
    return value.replace(/[^a-zA-Z0-9 ]/g, '').replace(/\s\s+/g, ' ');
}

function isEmpty(value) {
    return value === undefined || value === null || value === '';
}

// body: { accountNo, accountName, acqId, addInfo, amount, template | format, media }
// media: 'png' (default, same as the API), 'jpg' or 'svg'.
async function generate(body) {
    if (!body || Object.keys(body).length === 0) return fail('MISSING_ALL_PARAM');

    const accountNo = isEmpty(body.accountNo) ? '' : String(body.accountNo);
    if (!accountNo) return fail('MISSING_ACCOUNTNO');
    if (!/^[A-Za-z0-9]{3,25}$/.test(accountNo)) return fail('INVALID_ACCOUNTNO');

    // The API only takes a 6-digit BIN; offline we also accept a bank code / short name (e.g. "ICB").
    let acqId = isEmpty(body.acqId) ? '' : String(body.acqId).trim();
    if (!acqId) return fail('MISSING_ACQID');
    const bank = findBank(acqId);
    if (!/^\d{6}$/.test(acqId) && bank) acqId = bank.bin;
    if (!/^\d{6}$/.test(acqId)) return fail('INVALID_ACQID');

    if (isEmpty(body.accountName)) return fail('MISSING_ACCOUNTNAME');
    const accountName = removeSpecialChars(removeVietnameseTones(String(body.accountName)))
        .toUpperCase()
        .replace(/\d/g, '')
        .trim();
    if (!/^[A-Z ]{5,50}$/.test(accountName)) return fail('INVALID_ACCOUNTNAME');

    const addInfo = isEmpty(body.addInfo) ? '' : removeSpecialChars(removeVietnameseTones(String(body.addInfo))).trim();

    // Same truthiness as the API: number 0 means "no amount", any other value must be digits.
    const amount = body.amount ? String(body.amount) : '';
    if (amount && !/^\d{1,13}$/.test(amount)) return fail('INVALID_AMOUNT');

    const qrCode = genQRText({ acqId, accountNo, amount, addInfo });
    const data = { acqId, accountName, qrCode, qrDataURL: null };

    const template = body.template || body.format || 'qr_only';
    if (template === 'text') return success(data);
    if (template !== 'qr_only') {
        warnOnce(`template:${template}`, `template "${template}" is not drawn offline, qrDataURL is a plain QR code. For template images use genQuickLink({ template: '${template}' }) (img.vietqr.io).`);
    }

    data.qrDataURL = qrDataURL(qrCode, body.media, platform);
    return success(data);
}

function success(data) {
    return { code: '00', desc: 'Gen VietQR successful!', data };
}

module.exports = { generate };
