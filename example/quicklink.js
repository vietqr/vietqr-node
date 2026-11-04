let { VietQR } = require('../index');
let vietQR = new VietQR();

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