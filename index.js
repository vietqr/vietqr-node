let axios = require("axios");
class VietQR {
    constructor({
        clientID = '',
        apiKey = '',

    }) {
        this.clientID = clientID;
        this.apiKey = apiKey;
        this.message = 'Please check your API key and client key';
        this.apiUrl = 'https://api.vietqr.io';
    }

    checkKey() {
        if (this.clientID == '' || this.apiKey == '') {
            return false
        }
        return true
    }

    sendMessage(check) {
        if (!check)
            console.log(this.message);
    }

    async getTemplate() {
        if (this.checkKey()) {
            return getData(`${this.apiUrl}/v2/template`);
        }
        this.sendMessage(this.checkKey());

    }

    async getBanks() {
        if (this.checkKey()) {
            return await getData(`${this.apiUrl}/v2/banks`);
        }
        this.sendMessage(this.checkKey());
    }

    async genQRCodeBase64({
        bank = '',
        accountName = '',
        accountNumber = '',
        amount = '',
        memo = '',
        template = 'qr_only',
    }) {
        if (this.checkKey()) {
            return await postData(`${this.apiUrl}/v2/generate`, {
                accountNo: accountNumber,
                accountName: accountName,
                acqId: bank,
                addInfo: memo,
                amount: amount,
                template: template,
            });
        }
        this.sendMessage(this.checkKey());
    }

    async genQRCodeBase64V1({
        bank = '',
        accountName = '',
        accountNumber = '',
        amount = '',
        memo = '',
        format = 'qr_only',
    }) {
        if (this.checkKey()) {
            return await postData(`${this.apiUrl}/v1/generate`, {
                accountNo: accountNumber,
                accountName: accountName,
                acqId: bank,
                addInfo: memo,
                amount: amount,
                format: format,
            })
        }
        this.sendMessage(this.checkKey());
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
        if (this.checkKey()) {
            let url = media == '.jpg' ?
                encodeURI(`${this.apiUrl}/${bank}/${accountNumber}/${amount}/${(memo)}/${template}.jpg?accountName=${accountName}`).replace(/%20/g, "+")
                :
                encodeURI(`${this.apiUrl}/${bank}/${accountNumber}/${amount}/${memo}/${template}.png?accountName=${accountName}`).replace(/%20/g, "+");
            return url
        }
        this.sendMessage(this.checkKey());
    }
    createPaymentGateway({ theme_slug,
        platform = '',
        bankId = '',
        accountName = '',
        accountNumber = '',
        addInfo = '',
        amount = '',
    }) {
        if (this.checkKey()) {
            let entity = {
                apiKey: this.clientID,
                clientId: this.apiKey,
                theme_slug: theme_slug
            }
            if (bankId) entity.bankId = bankId;
            if (accountName) entity.accountName = accountName;
            if (accountNumber) entity.accountNumber = accountNumber;
            if (addInfo) entity.addInfo = addInfo;
            if (amount) entity.amount = amount;
            if (theme) entity.theme = theme;
            if (platform) entity.platform = platform;
            return await postData(`https://gateway.vietqr.io/payment-gateway/v1/createToken`, entity);
        }
        this.sendMessage(this.checkKey());
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

async function postData(url, data) {
    return await axios.post(url, data)
        .then(data => {
            // console.log(data);
            return data
        })
        .catch(err => {
            console.log(err);
            return err
        })
}
module.exports.VietQR = VietQR