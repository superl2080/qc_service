
const request = require('request');
const crypto = require('crypto');

const WECHAT_OPEN_APP_ID = process.env.WECHAT_OPEN_APP_ID;
const WECHAT_OPEN_APP_SECRET = process.env.WECHAT_OPEN_APP_SECRET;
const WECHAT_OPEN_ENCODE_KEY = process.env.WECHAT_OPEN_ENCODE_KEY;

const AES_KEY = new Buffer(WECHAT_OPEN_ENCODE_KEY + '=', 'base64');
const IV = AES_KEY.slice(0, 16);


const Decrypt = exports.Decrypt = (msg_encrypt) => {
    console.log('[CALL] Decrypt, msg_encrypt:');
    console.log(msg_encrypt);

    let decipher = crypto.createDecipheriv('aes-256-cbc', AES_KEY, IV);
    decipher.setAutoPadding(false);

    let decipheredBuff = Buffer.concat([decipher.update(msg_encrypt, 'base64'), decipher.final()]);
    decipheredBuff = decodePKCS7(decipheredBuff);

    let msg = decipheredBuff.slice(16);
    let msg_len = msg.slice(0, 4).readUInt32BE(0);
    let msg_content = msg.slice(4, msg_len + 4).toString('utf-8');
    let msg_appId =msg.slice(msg_len + 4).toString('utf-8');

    console.log('[CALLBACK] Decrypt, msg_decrypt:');
    console.log(msg_content);
    return msg_content;
};

function decodePKCS7(buff) {
    let pad = buff[buff.length - 1];
    if (pad < 1 || pad > 32) {
        pad = 0;
    }
    return buff.slice(0, buff.length - pad);
}

const Encrypt = exports.Encrypt = (msg_decrypt) => {
    console.log('[CALL] Encrypt, msg_decrypt:');
    console.log(msg_decrypt);

    let cipher = crypto.createCipheriv('aes-256-cbc', AES_KEY, IV);
    cipher.setAutoPadding(false);

    let random16 = crypto.pseudoRandomBytes(16);
    let msg_content = new Buffer(msg_decrypt);
    let msg_len = new Buffer(4);
    msg_len.writeUInt32BE(msg_content.length, 0);
    let msg_appId = new Buffer(WECHAT_OPEN_APP_ID);
    let raw_msg = Buffer.concat([random16, msg_len, msg_content, msg_appId]);

    raw_msg = encodePKCS7(raw_msg);
    let msg_encrypt = Buffer.concat([cipher.update(raw_msg), cipher.final()]).toString('base64');

    console.log('[CALLBACK] Encrypt, msg_encrypt:');
    console.log(msg_encrypt);
    return msg_encrypt;
};
 
function encodePKCS7(buff) {
    let blockSize = 32;
    let strSize = buff.length;
    let amountToPad = blockSize - (strSize % blockSize);
    let pad = new Buffer(amountToPad-1);
    pad.fill(String.fromCharCode(amountToPad));
    return Buffer.concat([buff, pad]);
}

