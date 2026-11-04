let { VietQR } = require('../index');
let vietQR = new VietQR()
vietQR.genQRCodeBase64({
    bank: '970415',
    accountName: 'QUY VAC XIN PHONG CHONG COVID',
    accountNumber: '113366668888',
    amount: '79000',
    memo: 'Ung Ho Quy Vac Xin',
    template : 'qr_only'
}).then((data)=>{console.log(data)})
.catch((err)=>{});