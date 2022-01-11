import { getData, postData } from "./config.js";
export class VietQR {
    #x_api_key = '';
    #x_client_key = '';
    #message = 'Please check your API key and client key';
    #api_url = 'https://api.vietqr.io';
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
    async genQRCodeSync({
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
    async genQRCodeSyncV1({
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
                encodeURI(`${this.#api_url}/${bank}/${accountNumber}/${amount}/${(memo)}/${template}.jpg?accountName=${accountName}`)
                :
                encodeURI(`${this.#api_url}/${bank}/${accountNumber}/${amount}/${memo}/${template}.png?accountName=${accountName}`);
            return url
        }
        this.#sendMessage(this.#checkKey())
    }


}
