import { getData, postData } from "./config.js";
export class Vietqr {
    constructor(accountNo = '', accountName = '', acqId = '', addInfo = '', amount = '', template = '',) {
        this.accountNo = accountNo;
        this.accountName = accountName;
        this.acqId = acqId;
        this.addInfo = addInfo;
        this.amount = amount;
        this.template = template;
    }
    async generateQRBase64() {
        postData('https://api.vietqr.io/v2/generate', {
            accountNo: this.accountNo,
            accountName: this.accountName,
            acqId: this.acqId,
            addInfo: this.addInfo,
            amount: this.amount,
            template: this.template,
        })
    }
    async getTemplate() {
        getData('https://api.vietqr.io/v2/template')
    }
    async getBanks() {
        getData('https://api.vietqr.io/v2/banks')
    }

}
export class VietQRClient {
    #x_api_key = '';
    #x_client_key = '';
    #message = 'Please check your API key and client key';
    constructor({
        x_api_key = '',
        x_client_key = '',
    }) {
        this.#x_api_key = x_api_key;
        this.#x_client_key = x_client_key;
    }
    #checkKey() {
        if (this.#x_api_key == '' || this.#x_client_key == '') {
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
            return getData('https://api.vietqr.io/v2/template')
        }
        this.#sendMessage(this.#checkKey())

    }
    async getBanks() {
        if (this.#checkKey()) {
            return await getData(`https://api.vietqr.io/v2/banks`)
        }
        this.#sendMessage(this.#checkKey())
    }
    async genQRCodeSyncV2({
        bank = '',
        accountName = '',
        accountNumber = '',
        amount = '',
        memo = '',
        template = 'qr_only',
    }) {
        if (this.#checkKey()) {
            return await postData('https://api.vietqr.io/v2/generate', {
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
    async genQRCodeSyncV1({
        bank = '',
        accountName = '',
        accountNumber = '',
        amount = '',
        memo = '',
        format = 'qr_only',
    }) {
        if (this.#checkKey()) {
            return await postData('https://api.vietqr.io/v1/generate', {
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
                `https://api.vietqr.io/${bank}/${accountNumber}/${amount}/${encodeURI(memo)}/${template}.jpg?accountName=${encodeURI(accountName)}`
                :
                `https://api.vietqr.io/${bank}/${accountNumber}/${amount}/${encodeURI(memo)}/${template}?accountName=${encodeURI(accountName)}`
            return url
        }
        this.#sendMessage(this.#checkKey())
    }


}
