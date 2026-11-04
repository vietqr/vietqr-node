# VietQR

[Tiếng Việt](README.md) | **English**

![](https://res.cloudinary.com/taskmanagereaglob123/image/upload/v1641970995/VietQR.46a78cbb_utwzzh.png)

Node.js library that creates VietQR (NAPAS 247) bank transfer QR codes from account details (bank, account number, name, amount, memo), with several image templates, and builds Quick Link image URLs.

> **From 1.2.0, QR codes are generated offline.** `genQRCodeBase64()` / `genQRCodeBase64V1()` no longer call
> `https://api.vietqr.io/v2/generate`: the QR payload and a plain QR image (PNG, JPG, SVG) are built inside the library.
> Template images (`compact`, `compact2`, `print`, ...) are online only, through [`genQuickLink()`](#genquicklink) links.
> **Existing code does not change**: the methods return the same object as before (`res.data.code`,
> `res.data.data.qrDataURL`, ...). `getTemplate()` is offline too, API keys are no longer needed, and
> `createPaymentGateway()` is retired. Only `getBanks()` still calls the API. See [Offline generation](#offline-generation).

## Table of Contents

- [Installation](#installation)
- [Example](#example)
- [Options](#options)
- [genQRCodeBase64()](#genqrcodebase64)
- [genQuickLink()](#genquicklink)
- [getTemplate()](#gettemplate)
- [getBanks()](#getbanks)
- [Offline generation](#offline-generation)
- [Upgrading from 1.1.x](#upgrading-from-11x)
- [Node.js and browsers](#nodejs-and-browsers)
- [License](#license)

## Installation

```bash
npm install vietqr
```

## Example

```javascript
import { VietQR } from 'vietqr';

// API keys are no longer needed (passing { clientID, apiKey } still works; the keys are ignored)
let vietQR = new VietQR();

// Bank list (calls the API)
vietQR.getBanks().then((banks) => { console.log(banks) })
    .catch((err) => {});

// Template list (offline)
vietQR.getTemplate().then((data) => { console.log(data) })
    .catch((err) => {});

// Plain QR image (offline)
vietQR.genQRCodeBase64({
    bank: '970415',
    accountName: 'QUY VAC XIN PHONG CHONG COVID',
    accountNumber: '113366668888',
    amount: '79000',
    memo: 'Ung Ho Quy Vac Xin'
}).then((data) => { console.log(data) })
    .catch((err) => {});

// Link to a template image (img.vietqr.io)
let link = vietQR.genQuickLink({
    bank: '970415',
    accountName: 'QUY VAC XIN PHONG CHONG COVID',
    accountNumber: '113366668888',
    amount: '79000',
    memo: 'Ung Ho Quy Vac Xin',
    template: 'compact'
});
```

## Options

| Option | Description |
| --- | --- |
| **bank** | Bank BIN (the `bin` field from `getBanks()` or the [bank list API](https://www.vietqr.io/danh-sach-api/api-tao-ma-qr/api-danh-sach-ma-ngan-hang)). Since 1.2.0 a bank code or short name also works (`'ICB'`, `'VietinBank'`) |
| **accountName** | Account holder name |
| **accountNumber** | Account number |
| **amount** | Amount |
| **memo** | Transfer description |
| **template** | `genQuickLink()`: image template `qr_only`, `compact`, `compact2`, `print`, ... (see `getTemplate()`). `genQRCodeBase64()`: `text` for the payload only, any other value gives a plain QR image |
| **media** | `genQRCodeBase64()`: `'png'` (default), `'jpg'` or `'svg'`. `genQuickLink()`: `'.png'` (default), `'.jpg'` or `'.svg'` |
| **clientID** | No longer needed (accepted and ignored) |
| **apiKey** | No longer needed (accepted and ignored) |

## genQRCodeBase64()

```javascript
vietQR.genQRCodeBase64({
    bank: '970415',
    accountName: 'QUY VAC XIN PHONG CHONG COVID',
    accountNumber: '113366668888',
    amount: '79000',
    memo: 'Ung Ho Quy Vac Xin',
    media: 'png' // 'png' | 'jpg' | 'svg'
}).then((data) => { console.log(data) })
    .catch((err) => {});
```

The promise resolves to an axios-like response (as in earlier versions); the body is in `res.data`:

```javascript
{
    "code": "00",
    "desc": "Gen VietQR successful!",
    "data": {
        "acqId": "970415",
        "accountName": "QUY VAC XIN PHONG CHONG COVID",
        "qrCode": "00020101021238560010A0000007270126000697041501121133666688880208QRIBFTTA...",
        "qrDataURL": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOwAAADeCAYAAAA..."
    }
}
```

`qrDataURL` is a **plain QR** image (the QR code only), generated offline. Template images are not drawn: with a
`template` such as `compact`, `compact2` or `print` you still get the plain QR, plus a one-time warning. For template
images use [`genQuickLink()`](#genquicklink). `template: 'text'` returns only the payload (`qrDataURL: null`).

`genQRCodeBase64V1()` works the same way, except the template option is called `format` instead of `template`.

## genQuickLink()

```javascript
let link = vietQR.genQuickLink({
    bank: '970415',
    accountName: 'QUY VAC XIN PHONG CHONG COVID',
    accountNumber: '113366668888',
    amount: '79000',
    memo: 'Ung Ho Quy Vac Xin',
    template: 'compact',
    media: '.jpg'
});
console.log(link);
// https://img.vietqr.io/image/970415-113366668888-compact.jpg?amount=79000&addInfo=Ung%20Ho%20Quy%20Vac%20Xin&accountName=QUY%20VAC%20XIN%20PHONG%20CHONG%20COVID
```

This is how to get **template images** (`compact`, `compact2`, `print`, ...): img.vietqr.io draws them online.
Builds a link in the [Quick Link](https://www.vietqr.io/qr-dong) syntax
`https://img.vietqr.io/image/<BANK_ID>-<ACCOUNT_NO>-<TEMPLATE>.<ext>?amount=&addInfo=&accountName=` (no request).
Empty fields are left out. Before 1.2.0 this returned an `https://api.vietqr.io/<bank>/<account>/...` link.

> **Note:** img.vietqr.io always serves **SVG**, even when the link ends in `.png` or `.jpg` (the server redirects to `.svg`).
> That is fine in an `<img>` tag on the web, but places that require a raster image, such as **email clients** and some
> **chat apps**, may not show it. This is how img.vietqr.io works; the library cannot change it.
> Where you need a real PNG/JPG, use [`genQRCodeBase64()`](#genqrcodebase64): it returns a plain QR image, generated offline.

## getTemplate()

```javascript
vietQR.getTemplate().then((data) => { console.log(data) })
    .catch((err) => {});
```

Offline (no request): returns the root themes from the [Quick Link docs](https://www.vietqr.io/qr-dong), with a demo link in the `img.vietqr.io` syntax.

```javascript
{
  code: '00',
  desc: 'success',
  data: [
    {
      name: 'Compact 2',
      template: 'compact2',
      size: '540x640',
      demo: 'https://img.vietqr.io/image/vietinbank-113366668888-compact2.svg?amount=790000&addInfo=dong%20qop%20quy%20vac%20xin&accountName=Quy%20Vac%20Xin%20Covid'
    },
    {
      name: 'Compact',
      template: 'compact',
      size: '540x540',
      demo: 'https://img.vietqr.io/image/vietinbank-113366668888-compact.svg?amount=790000&addInfo=dong%20qop%20quy%20vac%20xin&accountName=Quy%20Vac%20Xin%20Covid'
    },
    {
      name: 'QR Only',
      template: 'qr_only',
      size: '480x480',
      demo: 'https://img.vietqr.io/image/vietinbank-113366668888-qr_only.svg?amount=790000&addInfo=dong%20qop%20quy%20vac%20xin&accountName=Quy%20Vac%20Xin%20Covid'
    },
    {
      name: 'Print',
      template: 'print',
      size: '600x776',
      demo: 'https://img.vietqr.io/image/vietinbank-113366668888-print.svg?amount=790000&addInfo=dong%20qop%20quy%20vac%20xin&accountName=Quy%20Vac%20Xin%20Covid'
    },
    {
      name: 'Loax',
      template: 'loax',
      size: '2583x3719',
      demo: 'https://img.vietqr.io/image/vietinbank-113366668888-loax.svg?amount=790000&addInfo=dong%20qop%20quy%20vac%20xin&accountName=Quy%20Vac%20Xin%20Covid'
    }
  ]
}
```

## getBanks()

The only method that still calls the API (`https://api.vietqr.io/v2/banks`).

```javascript
vietQR.getBanks().then((data) => { console.log(data) })
    .catch((err) => {});
```

```javascript
{
  code: '00',
  desc: 'Get Bank list successful! Total 52 banks',
  data: [
    {
      id: 17,
      name: 'Ngân hàng TMCP Công thương Việt Nam',
      code: 'ICB',
      bin: '970415',
      isTransfer: 1,
      short_name: 'VietinBank',
      logo: 'https://api.vietqr.io/img/ICB.3d4d6760.png',
      support: 3
    },
    ....
  ]
}
```

## Offline generation

Since 1.2.0 the QR payload (EMVCo / NAPAS 247) and plain QR images are built locally:

| You need | Use | Runs |
| --- | --- | --- |
| QR payload (text) | `genQRText()`, or `genQRCodeBase64({ template: 'text' })` | offline |
| Plain QR image, PNG / JPG / SVG | `genQRCodeBase64({ media })` | offline |
| Link to a template image | `genQuickLink({ template })`, templates listed by `getTemplate()` | link built offline, image drawn by img.vietqr.io |

- **Same input, same output.** Inputs are cleaned and validated the way the API does it: Vietnamese accents removed,
  `accountName` upper-cased, same error `code` / `desc` (for example `21` for an invalid `accountNo`).
- **Template images are not generated offline.** `genQRCodeBase64()` with a `template` other than `qr_only` / `text`
  still returns the plain QR (with a warning); use `genQuickLink()` for template images.
- **No API keys:** `new VietQR()` is enough.
- **`createPaymentGateway()`** is retired: it makes no request and resolves to an `Error` (what earlier versions
  returned when the request failed).
- **`media`:** `'png'` (default), `'jpg'` or `'svg'`.

New functions:

```javascript
const { generateQR, genQRText, findBank, BANKS } = require('vietqr');

// Same body and JSON response as POST /v2/generate
const res = await generateQR({ acqId: '970415', accountNo: '113366668888', accountName: 'QUY VAC XIN',
  amount: 79000, addInfo: 'Ung ho', template: 'compact2' });

// Only the payload string (e.g. to draw the QR yourself)
genQRText({ acqId: '970415', accountNo: '113366668888', amount: 79000, addInfo: 'Ung ho' });
```

## Upgrading from 1.1.x

No code change is needed. What changed only prints a `[vietqr]` warning (once per kind):

- `clientID` / `apiKey` passed: the keys are ignored
- `createPaymentGateway()` called: retired, resolves to an `Error`
- `genQRCodeBase64()` with a template such as `compact`, `compact2`, `print`: returns the plain QR; switch to `genQuickLink()` for template images

See the [CHANGELOG](CHANGELOG.md) for details.

## Node.js and browsers

Pure JavaScript: no native modules, nothing to compile.

**Node.js:** PNG is compressed with the built-in `zlib`, JPG uses [`jpeg-js`](https://github.com/jpeg-js/jpeg-js), `getBanks()` uses the built-in `https` (no axios any more).

**Browsers** (Angular, React, ...): bundlers use `lib/platform.browser.js`. PNG and SVG are built in JavaScript,
JPG goes through a `<canvas>`; where there is no canvas (web workers, ...) a PNG is returned. `getBanks()` uses `fetch`.

## License

MIT License
