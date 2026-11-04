# VietQR

**Tiếng Việt** | [English](README.en.md)

![](https://res.cloudinary.com/taskmanagereaglob123/image/upload/v1641970995/VietQR.46a78cbb_utwzzh.png)

Thư viện Node.js tạo mã QR chuyển khoản VietQR (NAPAS 247) từ thông tin tài khoản (ngân hàng, số tài khoản, tên, số tiền, nội dung), với nhiều mẫu trình bày, và tạo link ảnh Quick Link.

> **Từ bản 1.2.0, mã QR được tạo offline.** `genQRCodeBase64()` / `genQRCodeBase64V1()` không còn gọi
> `https://api.vietqr.io/v2/generate`: chuỗi QR và ảnh QR trơn (PNG, JPG, SVG) được tạo ngay trong thư viện.
> Ảnh QR theo mẫu (`compact`, `compact2`, `print`, ...) chỉ có online, qua link [`genQuickLink()`](#genquicklink).
> **Code cũ không phải sửa**: hàm vẫn trả về đúng object như trước (`res.data.code`, `res.data.data.qrDataURL`, ...).
> `getTemplate()` cũng chạy offline, không cần API key nữa, `createPaymentGateway()` đã ngừng. Chỉ còn `getBanks()`
> gọi API (lỗi thì trả danh sách offline). Xem [Tạo QR offline](#tạo-qr-offline).

## Mục lục

- [Cài đặt](#cài-đặt)
- [Ví dụ](#ví-dụ)
- [Tham số](#tham-số)
- [genQRCodeBase64()](#genqrcodebase64)
- [genQuickLink()](#genquicklink)
- [getTemplate()](#gettemplate)
- [getBanks()](#getbanks)
- [Tạo QR offline](#tạo-qr-offline)
- [Nâng cấp từ 1.1.x](#nâng-cấp-từ-11x)
- [Node.js và trình duyệt](#nodejs-và-trình-duyệt)
- [License](#license)

## Cài đặt

```bash
npm install vietqr
```

## Ví dụ

```javascript
import { VietQR } from 'vietqr';

// Không cần API key nữa (truyền { clientID, apiKey } vẫn chạy, key sẽ bị bỏ qua)
let vietQR = new VietQR();

// Danh sách ngân hàng (gọi API)
vietQR.getBanks().then((banks) => { console.log(banks) })
    .catch((err) => {});

// Danh sách mẫu (offline)
vietQR.getTemplate().then((data) => { console.log(data) })
    .catch((err) => {});

// Tạo ảnh QR trơn (offline)
vietQR.genQRCodeBase64({
    bank: '970415',
    accountName: 'QUY VAC XIN PHONG CHONG COVID',
    accountNumber: '113366668888',
    amount: '79000',
    memo: 'Ung Ho Quy Vac Xin'
}).then((data) => { console.log(data) })
    .catch((err) => {});

// Link ảnh QR theo mẫu (img.vietqr.io)
let link = vietQR.genQuickLink({
    bank: '970415',
    accountName: 'QUY VAC XIN PHONG CHONG COVID',
    accountNumber: '113366668888',
    amount: '79000',
    memo: 'Ung Ho Quy Vac Xin',
    template: 'compact'
});
```

## Tham số

| Tham số | Ý nghĩa |
| --- | --- |
| **bank** | Mã BIN ngân hàng (trường `bin` trong `getBanks()` hoặc [API danh sách ngân hàng](https://www.vietqr.io/danh-sach-api/api-tao-ma-qr/api-danh-sach-ma-ngan-hang)). Từ 1.2.0 nhận thêm mã viết tắt hoặc tên thường gọi (`'ICB'`, `'VietinBank'`) |
| **accountName** | Tên chủ tài khoản |
| **accountNumber** | Số tài khoản |
| **amount** | Số tiền |
| **memo** | Nội dung chuyển khoản |
| **template** | `genQuickLink()`: mẫu ảnh `qr_only`, `compact`, `compact2`, `print`, ... (xem `getTemplate()`). `genQRCodeBase64()`: `text` để chỉ lấy chuỗi QR, giá trị khác đều ra ảnh QR trơn |
| **media** | `genQRCodeBase64()`: `'png'` (mặc định), `'jpg'` hoặc `'svg'`. `genQuickLink()`: `'.png'` (mặc định), `'.jpg'` hoặc `'.svg'` |
| **clientID** | Không cần nữa (vẫn nhận, bị bỏ qua) |
| **apiKey** | Không cần nữa (vẫn nhận, bị bỏ qua) |

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

Promise trả về một object giống response của axios (như các bản trước), nội dung nằm trong `res.data`:

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

`qrDataURL` là ảnh **QR trơn** (chỉ có mã QR), tạo offline. Hàm không vẽ ảnh theo mẫu: nếu truyền `template` như
`compact`, `compact2`, `print`, thư viện vẫn trả QR trơn và in cảnh báo một lần. Cần ảnh theo mẫu thì dùng
[`genQuickLink()`](#genquicklink). `template: 'text'` chỉ trả chuỗi QR (`qrDataURL: null`).

`genQRCodeBase64V1()` dùng như trên, chỉ khác tên tham số mẫu là `format` thay vì `template`.

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

Đây là cách lấy **ảnh QR theo mẫu** (`compact`, `compact2`, `print`, ...): ảnh do img.vietqr.io vẽ online.
Tạo link theo cú pháp [Quick Link](https://www.vietqr.io/qr-dong)
`https://img.vietqr.io/image/<BANK_ID>-<ACCOUNT_NO>-<TEMPLATE>.<ext>?amount=&addInfo=&accountName=` (không gọi mạng).
Trường nào rỗng sẽ không đưa vào link. Trước bản 1.2.0, hàm này trả link dạng `https://api.vietqr.io/<bank>/<account>/...`.

> **Lưu ý:** img.vietqr.io luôn trả ảnh **SVG**, kể cả khi link ghi `.png` hay `.jpg` (server tự chuyển sang `.svg`).
> Hiển thị bằng thẻ `<img>` trên web thì không sao, nhưng nơi bắt buộc ảnh raster như **email client** hay một số
> **app chat** có thể không hiện ảnh. Đây là cách img.vietqr.io đang chạy, thư viện không đổi được.
> Chỗ nào cần PNG/JPG thật thì dùng [`genQRCodeBase64()`](#genqrcodebase64): hàm này trả ảnh QR trơn, tạo offline.

## getTemplate()

```javascript
vietQR.getTemplate().then((data) => { console.log(data) })
    .catch((err) => {});
```

Chạy offline (không gọi mạng): trả về các theme gốc trong [tài liệu Quick Link](https://www.vietqr.io/qr-dong), kèm link demo theo cú pháp `img.vietqr.io`.

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

Hàm duy nhất còn gọi API (`https://api.vietqr.io/v2/banks`) để lấy danh sách mới nhất. Nếu không gọi được
(mất mạng, quá 2 giây, API lỗi), hàm trả danh sách offline có sẵn trong thư viện, cùng định dạng, và in cảnh báo một lần.

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

## Tạo QR offline

Từ bản 1.2.0, chuỗi QR (chuẩn EMVCo / NAPAS 247) và ảnh QR trơn được tạo ngay trên máy:

| Cần gì | Dùng | Chạy |
| --- | --- | --- |
| Chuỗi QR (text) | `genQRText()`, hoặc `genQRCodeBase64({ template: 'text' })` | offline |
| Ảnh QR trơn PNG / JPG / SVG | `genQRCodeBase64({ media })` | offline |
| Link ảnh QR theo mẫu | `genQuickLink({ template })`, danh sách mẫu ở `getTemplate()` | link tạo offline, ảnh do img.vietqr.io vẽ |

- **Cùng đầu vào, cùng kết quả.** Dữ liệu được làm sạch và kiểm tra giống API: bỏ dấu tiếng Việt, viết hoa
  `accountName`, cùng mã lỗi `code` / `desc` (ví dụ `21` khi `accountNo` không hợp lệ).
- **Ảnh theo mẫu không tạo offline.** `genQRCodeBase64()` với `template` khác `qr_only` / `text` vẫn trả QR trơn
  (có cảnh báo); muốn ảnh theo mẫu thì dùng `genQuickLink()`.
- **Không cần API key:** `new VietQR()` là đủ.
- **`createPaymentGateway()`** đã ngừng: không gọi mạng, trả về một `Error` (giống cách bản cũ trả về khi request lỗi).
- **`media`:** `'png'` (mặc định), `'jpg'` hoặc `'svg'`.

Hàm mới:

```javascript
const { generateQR, genQRText, findBank, BANKS } = require('vietqr');

// Body và response JSON giống hệt POST /v2/generate
const res = await generateQR({ acqId: '970415', accountNo: '113366668888', accountName: 'QUY VAC XIN',
  amount: 79000, addInfo: 'Ung ho', template: 'compact2' });

// Chỉ lấy chuỗi QR (để tự vẽ mã QR)
genQRText({ acqId: '970415', accountNo: '113366668888', amount: 79000, addInfo: 'Ung ho' });
```

## Nâng cấp từ 1.1.x

Không cần sửa code. Các phần đã thay đổi chỉ in một cảnh báo `[vietqr]` (mỗi loại một lần):

- có truyền `clientID` / `apiKey`: key bị bỏ qua
- gọi `createPaymentGateway()`: đã ngừng, trả về `Error`
- `genQRCodeBase64()` với mẫu như `compact`, `compact2`, `print`: trả QR trơn, muốn ảnh theo mẫu thì đổi sang `genQuickLink()`

Chi tiết xem [CHANGELOG](CHANGELOG.md).

## Node.js và trình duyệt

Thư viện viết bằng JavaScript thuần, không có module native, không cần compile.

**Node.js:** PNG nén bằng `zlib` có sẵn, JPG dùng [`jpeg-js`](https://github.com/jpeg-js/jpeg-js), `getBanks()` gọi bằng `https` có sẵn (không dùng axios nữa).

**Trình duyệt** (Angular, React, ...): bundler sẽ dùng `lib/platform.browser.js`. PNG và SVG tạo bằng JavaScript,
JPG vẽ qua `<canvas>`; nơi không có canvas (web worker, ...) thì trả PNG. `getBanks()` dùng `fetch`.

## License

MIT License
