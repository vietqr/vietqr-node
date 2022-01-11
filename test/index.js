import { VietQR } from '../index.js';
// let h = new Vietqr('113366668888', 'QUY VAC XIN PHONG CHONG COVID', '970415', 'Ung Ho Quy Vac Xin', '79000', 'compact');
let VietQR = new VietQR({
    x_api_key: '1',
    x_client_key: '1',
})
// let templates = await VietQR.getBanks()
// console.log(templates);
// let qrCode = await VietQR.genQRCodeSyncV2({
//     bank: '970415',
//     accountName: 'QUY VAC XIN PHONG CHONG COVID',
//     accountNumber: '113366668888',
//     amount: '79000',
//     memo: 'Ung Ho Quy Vac Xin',
// })
// console.log(qrCode);

let quickLink = VietQR.genQuickLink({
        bank: '970415',
        accountName: 'QUY VAC XIN PHONG CHONG COVID',
        accountNumber: '113366668888',
        amount: '79000',
        memo: 'Ung Ho Quy Vac Xin',
    })
console.log(b);
