// Snapshot of https://api.vietqr.io/v2/banks (2026-11-04): resolves bank codes offline and is the
// getBanks() fallback when the API cannot be reached.
const BANKS = require('./banks.json');

function norm(value) {
    return String(value).normalize('NFKC').trim().toLowerCase().replace(/[\s_-]+/g, '');
}

const byKey = new Map();
for (const bank of BANKS) {
    for (const key of [bank.bin, bank.code, bank.shortName]) {
        byKey.set(norm(key), bank);
    }
}

function findBank(id) {
    if (id === undefined || id === null || id === '') return undefined;
    return byKey.get(norm(id));
}

module.exports = { BANKS, findBank };
