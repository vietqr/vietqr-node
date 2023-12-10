type ResponseKind = TemplateResponse;

export type Response<D extends ResponseKind, C extends string> = Promise<{
	code: C;
	desc: string;
	data: C extends "00" ? [D] : [undefined];
}>;

export type TemplateResponse = {
	acpId: number;
	accountName: string;
	qrCode: string;
	qrDataURL: string;
};

export type BanksResponse = {
	id: number;
	name: string;
	code: string;
	bin: string;
	shortName: string;
	logo: string;
	transferSupported: number;
	lookupSupported: number;
}[];

type TemplateKind = "compact2" | "compact" | "qr_only" | "print";

type TSBase = {
	bank: number;
	accountName: string;
	accountNumber: number;
	amount: number;
	memo: string;
};

export class VietQR {
	readonly clientID: string;
	readonly apiKey: string;
	readonly message: string;
	readonly apiUrl: string;
	constructor({ clientID = "", apiKey = "" });

	checkKey(): boolean;
	// wth
	sendMessage(check: boolean);
	getTemplate(): Response<void>; // TODO: idk
	getBanks(): Response<BanksResponse>;
	genQRCodeBase64(
		payload: TSBase & {
			template: TemplateKind;
		},
	): Response<TemplateResponse>;
	genQRCodeBase64V1(
		payload: TSBase & { format: TemplateKind },
	): Response<TemplateResponse>;
	genQuickLink(
		payload: TSBase & { template: TemplateKind; media: string },
	): string | undefined;
	createPaymentGateway(payload: {
		platform: string;
		bankId: string;
		accountName: string;
		accountNumber: number;
		addInfo: string;
		amount: number;
	}): Response<void>; // TODO: idk
}
