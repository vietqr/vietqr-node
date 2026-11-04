let { VietQR } = require('../index');
let vietQR = new VietQR()
vietQR.getBanks().then((banks)=>{console.log(banks)})
.catch((err)=>{});