
const async = require('async');
const wechatHelper = require('../../imports/helpers/wechat');
const cryptHelper = require('../../imports/helpers/crypt');


const openNotice = exports.openNotice = (req, res) => {

    async.auto({
        pre: (callback) => {
            console.log('[CALL] openNotice, pre');
            callback(null, {
                req: req,
                res: res
            });
        },

        parseXml: ['pre', (result, callback) => {
            console.log('[CALL] openNotice, parseXml');
            cryptHelper.ParseJsonFromXml(result.pre.req.body, callback);
        }],

        decrypt: ['parseXml', (result, callback) => {
            console.log('[CALL] openNotice, decrypt');
            const decryptData = wechatHelper.Decrypt(result.parseXml.xml.Encrypt[0]);
            cryptHelper.ParseJsonFromXml(decryptData, callback);
        }],

        checkTicket: ['decrypt', (result, callback) => {
            console.log('[CALL] openNotice, checkTicket');
            if( result.decrypt.xml.InfoType[0] == 'component_verify_ticket' ) {
                wechatHelper.UpdateTicket(result.decrypt.xml.ComponentVerifyTicket[0], callback);
            }
        }]

    }, (err, results) => {
        if( err ) {
            console.log('[ERROR] openNotice, err:');
            console.log(err);
        }
        console.log('[CALLBACK] openNotice');
        res.send('success');
    });
};


