
const async = require('async');
const systemConfigModel = require('../../imports/models/systemConfig');
const wechatHelper = require('../../imports/helpers/wechat');
const cryptHelper = require('../../imports/helpers/crypt');
const toolHelper = require('../../imports/helpers/tool');

const WECHAT_OPEN_APP_ID = process.env.WECHAT_OPEN_APP_ID;


const authNotice = exports.authNotice = (req, res, next) => {


    async.auto({
        Pre: (callback) => {
            console.log('[CALL] authNotice, Pre');
            callback(null, {
                req: req,
                res: res,
                next: next
            });
        },

        ParseXml: ['Pre', (result, callback) => {
            console.log('[CALL] authNotice, ParseXml');
            cryptHelper.ParseJsonFromXml(result.Pre.req.body, callback);
        }],

        Decrypt: ['ParseXml', (result, callback) => {
            console.log('[CALL] authNotice, Decrypt');
            const decryptData = wechatHelper.Decrypt(result.ParseXml.xml.Encrypt[0]);
            cryptHelper.ParseJsonFromXml(decryptData, callback);
        }],

        CheckInfo: ['Decrypt', (result, callback) => {
            console.log('[CALL] authNotice, CheckInfo');
            switch( result.Decrypt.xml.InfoType[0] ){
            case 'component_verify_ticket':
                console.log('[CALL] authNotice, checkTicket');
                wechatHelper.UpdateTicket(result.Decrypt.xml.ComponentVerifyTicket[0], callback);
                break;
            case 'authorized':
            case 'updateauthorized':
                console.log('[CALL] authNotice, authorized/updateauthorized');
                wechatHelper.UpdateWechatMpAuthInfo({
                    auth_code: result.Decrypt.xml.AuthorizationCode[0],
                    pre_auth_code: result.Decrypt.xml.PreAuthCode[0]
                }, callback);
                break;
            case 'unauthorized':
                console.log('[CALL] authNotice, unauthorized');
                wechatHelper.CancelWechatMpAuthInfo({
                    appid: result.Decrypt.xml.AuthorizerAppid[0]
                }, callback);
                break;
            default:
                callback(null);
            }
        }]

    }, (err, result) => {
        console.log('[CALLBACK] authNotice');
        result.Pre.res.send('success');
        if( err ) {
            result.Pre.next(err);
        }
    });
};


const adNotice = exports.adNotice = (req, res, next) => {

    async.auto({
        Pre: (callback) => {
            console.log('[CALL] adNotice, Pre');
            callback(null, {
                req: req,
                res: res,
                next: next
            });
        },

        ParseXml: ['Pre', (result, callback) => {
            console.log('[CALL] adNotice, ParseXml');
            cryptHelper.ParseJsonFromXml(result.Pre.req.body, callback);
        }],

        Decrypt: ['ParseXml', (result, callback) => {
            console.log('[CALL] adNotice, Decrypt');
            const decryptData = wechatHelper.Decrypt(result.ParseXml.xml.Encrypt[0]);
            cryptHelper.ParseJsonFromXml(decryptData, callback);
        }],

        CheckInfo: ['Decrypt', (result, callback) => {
            console.log('[CALL] adNotice, CheckInfo');

            if( result.Decrypt.xml.MsgType == 'event'
                && (result.Decrypt.xml.Event[0] == 'subscribe' || result.Decrypt.xml.Event[0] == 'SCAN')
                && result.Decrypt.xml.EventKey[0] ) {
                let userId = result.Decrypt.xml.EventKey[0];
                if( result.Decrypt.xml.Event == 'subscribe' ) {
                    userId = userId.slice(8);
                }
                wechatHelper.AdSubscribe({
                    userId: userId,
                    appid: result.Pre.req.query.appid,
                    openId: result.Decrypt.xml.FromUserName,
                    event: result.Decrypt.xml.Event[0]
                }, (err, result) => {
                    if( !err ){
                        results.pre.res.send('success');
                    }
                    callback(err);
                });
            } else if( result.Decrypt.xml.MsgType == 'text' ){
                systemConfigModel.GetWechatOpen(null, (err, wechatOpen) => {
                    if( !err
                        && wechatOpen.auto_reply == result.Decrypt.xml.Content ) {
                        const msgEncryptXml = wechatHelper.EncryptMsg({
                            xml: {
                                ToUserName: result.Decrypt.xml.FromUserName,
                                FromUserName: result.Decrypt.xml.ToUserName,
                                CreateTime: new Date(),
                                MsgType: result.Decrypt.xml.MsgType,
                                Content: process.env.SIT_URL + '/subscribe/' + result.Pre.req.query.appid
                            },
                            token: process.env.WECHAT_OPEN_MESSAGE_TOKEN,
                            timestamp: result.Pre.req.query.timestamp,
                            nonce: result.Pre.req.query.nonce
                        });
                        results.pre.res.send(msgEncryptXml);
                        callback(null);
                    } else {
                        callback(new Error('adNotice: do not handle message'));
                    }
                });
            } else {
                callback(new Error('adNotice: do not handle message'));
            }
        }]

    }, (err, result) => {
        console.log('[CALLBACK] adNotice');
        if( err ) {
            result.pre.res.send('success');
            result.pre.next(err);
        }
    });
};

const adAuth = exports.adAuth = (req, res, next) => {
    console.log('[CALL] adAuth');

    wechatHelper.CreatePreAuthCode(req.query.adId, (err, pre_auth_code) => {
        console.log('[CALLBACK] adAuth');
        if( err ) {
            return next(err);
        }
        let redirect_uri = encodeURIComponent('http://' + req.headers.host + '/wechat/open/adAuthSuccess?pre_auth_code=' + pre_auth_code);
        let uri = 'https://mp.weixin.qq.com/cgi-bin/componentloginpage?component_appid=' + WECHAT_OPEN_APP_ID;
        uri += '&pre_auth_code=' + pre_auth_code;
        uri += '&auth_type=1'
        uri += '&redirect_uri=' + redirect_uri;
        res.render('page-button', { title: '授权公众号吸粉', message: '点击确认，并使用公众号运营者微信进行扫码授权。青橙承诺，授权仅用于吸粉投放和粉丝关注判断。', button: uri });
    });

};

const adAuthSuccess = exports.adAuthSuccess = (req, res, next) => {
    console.log('[CALL] adAuthSuccess');

    wechatHelper.UpdateWechatMpAuthInfo({
        auth_code: req.query.auth_code,
        pre_auth_code: req.query.pre_auth_code
    }, (err, results) => {
        console.log('[CALLBACK] adAuthSuccess');
        if( err ) {
            next(err);
        }
        res.render('page', { title: '授权公众号吸粉', message: '授权成功！感谢使用青橙服务。' });
    });
}

