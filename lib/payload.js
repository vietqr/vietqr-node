// Builds the EMVCo / NAPAS 247 VietQR payload string.

function leaf(id, content) {
    content = String(content);
    return id + String(content.length).padStart(2, '0') + content;
}

const CRC_TABLE = (() => {
    const table = [];
    for (let n = 0; n < 256; n++) {
        let crc = 0;
        let c = n << 8;
        for (let i = 0; i < 8; i++) {
            crc = ((crc ^ c) & 0x8000) ? ((crc << 1) ^ 0x1021) : (crc << 1);
            c <<= 1;
        }
        table.push(crc & 0xffff);
    }
    return table;
})();

function crc16(str) {
    let crc = 0xffff;
    for (let i = 0; i < str.length; i++) {
        crc = ((crc << 8) ^ CRC_TABLE[((crc >> 8) ^ str.charCodeAt(i)) & 0xff]) & 0xffff;
    }
    return crc.toString(16).toUpperCase().padStart(4, '0');
}

function genQRText({ acqId, accountNo, amount, addInfo }) {
    let content = '';
    content += leaf('00', '01');
    content += leaf('01', amount ? '12' : '11');
    content += leaf('38',
        leaf('00', 'A000000727') +
        leaf('01', leaf('00', acqId) + leaf('01', accountNo)) +
        leaf('02', 'QRIBFTTA'));
    content += leaf('53', '704');
    if (amount) content += leaf('54', amount);
    content += leaf('58', 'VN');
    if (addInfo) content += leaf('62', leaf('08', addInfo));
    content += '6304';
    return content + crc16(content);
}

module.exports = { genQRText, crc16 };
