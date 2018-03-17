
const bcrypt = require('bcrypt');
const crypto = require('crypto');


module.exports = {

  BCRYPT_SALT_ROUNDS: 10,

  passwordCrypt: async function (param) {

    const result = await bcrypt.hash(param.password, this.BCRYPT_SALT_ROUNDS);
    return result;
  },

  passwordCompare: async function (param) {

    const result = await bcrypt.compare(param.passwordAuth, param.passwordCrypt);

    return result;
  },

  encodeUnicode: async function (param) {

    let result = [];
    for ( let i=0; i < param.str.length; i++ ) {
      result[i] = ( '00' + param.str.charCodeAt(i).toString(16) ).slice(-4);
    }
    result = '\\u' + result.join('\\u');

    return result;
  },

  decodeUnicode: async function (param) {

    let result = param.str.replace(/\\/g, "%");
    result = unescape(result);

    return result;
  },

  decryptWechatMsg: async function (param) {

    const json = await this.models.utils.request.getJsonFromXml({ xml: param.msg });
    const decryptData = await this.decryptWechatAes256({
      data: json.Encrypt,
      aesKey: param.aesKey,
    });
    const result = await this.models.utils.request.getJsonFromXml({ xml: decryptData });

    return result;
  },

  encryptWechatMsg: async function (param) {

    const xml = await this.models.utils.request.getXmlFromJsonForceCData({ json: param.msg });
    const encryptData = await this.encryptWechatAes256({
      data: xml,
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
    const msgEncryptXml = await this.models.utils.request.getXmlFromJsonForceCData({ json: msgEncryptJson });

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

    let strEncrypt = new Buffer(param.str);
    strEncrypt = strEncrypt.toString('base64');
    strEncrypt = strEncrypt.replace('/\+/g', '-');
    strEncrypt = strEncrypt.replace('/\//g', '_');

    return strEncrypt;
  },

  decryptString: async function (param) {

    let strDecrypt = param.str.replace('/\-/g', '+');
    strDecrypt = strDecrypt.replace('/\_/g', '/');
    strDecrypt = new Buffer(strDecrypt, 'base64');
    strDecrypt = strDecrypt.toString('utf-8');

    return strDecrypt;
  },

  encodePKCS7: async function (param) {

    const blockSize = 32;
    const strSize = param.data.length;
    const amountToPad = blockSize - (strSize % blockSize);
    const pad = new Buffer(amountToPad - 1);
    pad.fill(String.fromCharCode(amountToPad));
    const result = Buffer.concat([param.data, pad]);

    return result;
  },

  decodePKCS7: async function (param) {

    let pad = param.data[param.data.length - 1];
    if (pad < 1 || pad > 32) {
      pad = 0;
    }
    const result = param.data.slice(0, param.data.length - pad);

    return result;
  },

  encodeSha1: async function (param) {

    const result = crypto.createHash('sha1').update(param.data).digest('hex');

    return result;
  },

  encodeMd5: async function (param) {

    const result = crypto.createHash('md5').update(param.data).digest('hex').toUpperCase();

    return result;
  },

  randomHex: async function (param) {

    const result = crypto.pseudoRandomBytes(param.byte).toString('hex');

    return result;
  },

};

