let { VietQR } = require('../index.js');

let vietQR = new VietQR({
    x_api_key: 'b9f13b6a-3779-4e2b-807f-2731cc623785',
    x_client_key: '1f095a30-b744-43a2-8a67-080a5d25c481',
})

let quickLink = vietQR.genQuickLink({
        bank: '970415',
        accountName: 'QUY VAC XIN PHONG CHONG COVID',
        accountNumber: '113366668888',
        amount: '79000',
        memo: 'Ung Ho Quy Vac Xin',
    })
console.log(quickLink);
