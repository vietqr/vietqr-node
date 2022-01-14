let axios = require("axios");
class VietQR {
    #clientID = '';
    #apiKey = '';
    #message = 'Please check your API key and client key';
    #api_url = 'https://api.vietqr.io';
    constructor({
        clientID = '',
        apiKey = '',
    }) {
        this.#clientID = clientID;
        this.#apiKey = apiKey;
    }
    #checkKey() {
        if (this.#clientID == '' || this.#apiKey == '') {
            return false
        }
        return true
    }
    #sendMessage(check) {
        if (!check)
            console.log(this.#message);
    }
    async getTemplate() {
        if (this.#checkKey()) {
            return getData(`${this.#api_url}/v2/template`)
        }
        this.#sendMessage(this.#checkKey())

    }
    async getBanks() {
        if (this.#checkKey()) {
            return await getData(`${this.#api_url}/v2/banks`)
        }
        this.#sendMessage(this.#checkKey())
    }
    async genQRCodeBase64({
        bank = '',
        accountName = '',
        accountNumber = '',
        amount = '',
        memo = '',
        template = 'qr_only',
    }) {
        if (this.#checkKey()) {
            return await postData(`${this.#api_url}/v2/generate`, {
                accountNo: accountNumber,
                accountName: accountName,
                acqId: bank,
                addInfo: memo,
                amount: amount,
                template: template,
            })
        }
        this.#sendMessage(this.#checkKey())
    }
    async genQRCodeBase64V1({
        bank = '',
        accountName = '',
        accountNumber = '',
        amount = '',
        memo = '',
        format = 'qr_only',
    }) {
        if (this.#checkKey()) {
            return await postData(`${this.#api_url}/v1/generate`, {
                accountNo: accountNumber,
                accountName: accountName,
                acqId: bank,
                addInfo: memo,
                amount: amount,
                format: format,
            })
        }
        this.#sendMessage(this.#checkKey())
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
        if (this.#checkKey()) {
            let url = media == '.jpg' ?
                encodeURI(`${this.#api_url}/${bank}/${accountNumber}/${amount}/${(memo)}/${template}.jpg?accountName=${accountName}`).replace(/%20/g, "+")
                :
                encodeURI(`${this.#api_url}/${bank}/${accountNumber}/${amount}/${memo}/${template}.png?accountName=${accountName}`).replace(/%20/g, "+");
            return url
        }
        this.#sendMessage(this.#checkKey())
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
module.exports.VietQR =VietQR