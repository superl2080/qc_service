
const bcrypt = require('bcrypt');
const crypto = require('crypto');


module.exports = {

    BCRYPT_SALT_ROUNDS: 10,

    passwordCrypt: async function (param) {
        console.log(__filename + '\n[CALL] passwordCrypt, param:');
        console.log(param);

        const result = await bcrypt.hash(param.password, this.BCRYPT_SALT_ROUNDS);

        console.log('[CALLBACK] passwordCrypt, result:');
        console.log(result);
        return result;
    },

    passwordCompare: async function (param) {
        console.log(__filename + '\n[CALL] passwordCompare, param:');
        console.log(param);

        const result = await bcrypt.compare(param.passwordAuth, param.passwordCrypt);

        console.log('[CALLBACK] passwordCompare, result:');
        console.log(result);
        return result;
    },

    decryptWechatMsg: async function (param) {
        console.log(__filename + '\n[CALL] decryptWechatMsg, param:');
        console.log(param);

        const json = await this.models.utils.request.getJsonFromXml({ xml: param.msg });
        const decryptData = this.decryptWechatAes256({
            data: json.Encrypt,
            aesKey: param.aesKey,
        });
        const result = await this.models.utils.request.getJsonFromXml({ xml: decryptData });

        console.log('[CALLBACK] decryptWechatMsg, result:');
        console.log(result);
        return result;
    },

    encryptWechatMsg: async function (param) {
        console.log(__filename + '\n[CALL] encryptWechatMsg, param:');
        console.log(param);

        const xml = await this.models.utils.request.getXmlFromJsonForceCData({ xml: param.msg });
        const encryptData = this.encryptWechatAes256({
            date: xml,
            aesKey: param.aesKey,
            appId: param.appId,
        });
        const msgSignatureArray = new Array(
            param.token, 
            param.timestamp, 
            param.nonce, 
            encryptData,
        );
        const msgEncryptJson = {
            Encrypt: encryptData,
            MsgSignature: await this.encodeSha1({ data: msgSignatureArray.sort().join('') }),
            TimeStamp: param.timestamp,
            Nonce: param.nonce,
        };
        const msgEncryptXml = await this.models.utils.request.getXmlFromJsonForceCData(msgEncryptJson);

        console.log('[CALLBACK] encryptWechatMsg, result:');
        console.log(msgEncryptXml);
        return msgEncryptXml;
    },

    encryptWechatAes256: async function (param) {

        const aesKey = new Buffer(param.aesKey + '=', 'base64');
        const aesIv = aesKey.slice(0, 16);

        const msg_content = new Buffer(param.data);
        const msg_len = new Buffer(4);
        msg_len.writeUInt32BE(msg_content.length, 0);
        const msg_appId = new Buffer(param.appId);
        const msg = Buffer.concat([crypto.pseudoRandomBytes(16), msg_len, msg_content, msg_appId]);

        const cipher = crypto.createCipheriv('aes-256-cbc', aesKey, aesIv);
        const msgEncrypt = Buffer.concat([cipher.update(msg), cipher.final()]).toString('base64');

        return msgEncrypt;
    },


    decryptWechatAes256: async function (param) {

        const aesKey = new Buffer(param.aesKey + '=', 'base64');
        const aesIv = aesKey.slice(0, 16);

        const decipher = crypto.createDecipheriv('aes-256-cbc', aesKey, aesIv);
        decipher.setAutoPadding(false);
        const decipheredBuff = Buffer.concat([decipher.update(param.data, 'base64'), decipher.final()]);

        const msgDecrypt = await this.decodePKCS7({ data: decipheredBuff });
        const msg = msgDecrypt.slice(16);
        const msg_len = msg.slice(0, 4).readUInt32BE(0);
        const msg_content = msg.slice(4, msg_len + 4).toString('utf-8');
        const msg_appId = msg.slice(msg_len + 4).toString('utf-8');

        return msg_content;
    },

    encryptString: async function (param) {
        console.log(__filename + '\n[CALL] encryptString, param:');
        console.log(param);

        let strEncrypt = new Buffer(param.str);
        strEncrypt = strEncrypt.toString('base64');
        strEncrypt = strEncrypt.replace('/\+/g', '-');
        strEncrypt = strEncrypt.replace('/\//g', '_');

        console.log('[CALLBACK] encryptString, result:');
        console.log(strEncrypt);
        return strEncrypt;
    },

    decryptString: async function (param) {
        console.log(__filename + '\n[CALL] decryptString, param:');
        console.log(param);

        let strDecrypt = param.str.replace('/\-/g', '+');
        strDecrypt = strDecrypt.replace('/\_/g', '/');
        strDecrypt = new Buffer(strDecrypt, 'base64');
        strDecrypt = strDecrypt.toString('utf-8');

        console.log('[CALLBACK] decryptString, result:');
        console.log(strDecrypt);
        return strDecrypt;
    },

    encodePKCS7: async function (param) {
        console.log(__filename + '\n[CALL] encodePKCS7, param:');
        console.log(param);

        const blockSize = 32;
        const strSize = param.data.length;
        const amountToPad = blockSize - (strSize % blockSize);
        const pad = new Buffer(amountToPad - 1);
        pad.fill(String.fromCharCode(amountToPad));
        const result = Buffer.concat([param.data, pad]);

        console.log('[CALLBACK] encodePKCS7, result:');
        console.log(result);
        return result;
    },

    decodePKCS7: async function (param) {
        console.log(__filename + '\n[CALL] decodePKCS7, param:');
        console.log(param);

        let pad = param.data[param.data.length - 1];
        if (pad < 1 || pad > 32) {
            pad = 0;
        }
        const result = param.data.slice(0, param.data.length - pad);

        console.log('[CALLBACK] decodePKCS7, result:');
        console.log(result);
        return result;
    },

    encodeSha1: async function (param) {
        console.log(__filename + '\n[CALL] encodeSha1, param:');
        console.log(param);

        const result = crypto.createHash('sha1').update(param.data).digest('hex');

        console.log('[CALLBACK] encodeSha1, result:');
        console.log(result);
        return result;
    },

    encodeMd5: async function (param) {
        console.log(__filename + '\n[CALL] encodeMd5, param:');
        console.log(param);

        const result = crypto.createHash('md5').update(param.data).digest('hex').toUpperCase();

        console.log('[CALLBACK] encodeMd5, result:');
        console.log(result);
        return result;
    },

    randomHex: async function (param) {
        console.log(__filename + '\n[CALL] randomHex, param:');
        console.log(param);

        const result = crypto.pseudoRandomBytes(param.byte).toString('hex');

        console.log('[CALLBACK] randomHex, result:');
        console.log(result);
        return result;
    },

};

