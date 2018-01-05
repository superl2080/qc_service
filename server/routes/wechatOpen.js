
const async = require('async');
const adModel = require('../../imports/models/ad');
const systemConfigModel = require('../../imports/models/systemConfig');
const wechatHelper = require('../../imports/helpers/wechat');
const cryptHelper = require('../../imports/helpers/crypt');
const wechatApi = require('../../imports/api/wechat');


const authNotice = exports.authNotice = (req, res, next) => {


    async.auto({
        ParseMsg: (callback) => {
            console.log('[CALL] authNotice, ParseMsg');
            cryptHelper.ParseDecryptMsg({ msg: req.body }, callback);
        },

        CheckMsg: ['ParseMsg', (result, callback) => {
            console.log('[CALL] authNotice, CheckMsg');
            switch( result.ParseMsg.InfoType ){
            case 'component_verify_ticket':
                console.log('[CALL] authNotice, checkTicket');
                systemConfigModel.UpdateWechatOpenTicket(result.ParseMsg.ComponentVerifyTicket, callback);
                break;
            case 'authorized':
            case 'updateauthorized':
                console.log('[CALL] authNotice, authorized/updateauthorized');
                wechatHelper.UpdateWechatMpAuthInfo({
                    auth_code: result.ParseMsg.AuthorizationCode,
                    pre_auth_code: result.ParseMsg.PreAuthCode
                }, callback);
                break;
            case 'unauthorized':
                console.log('[CALL] authNotice, unauthorized');
                adModel.CancelAdWechatMpAuthInfo(result.ParseMsg.AuthorizerAppid, callback);
                break;
            default:
                callback(null);
            }
        }]

    }, (err, result) => {
        console.log('[CALLBACK] authNotice');
        res.send('success');
        if( err ) {
            next(err);
        }
    });
};


const adNotice = exports.adNotice = (req, res, next) => {

    async.auto({
        ParseMsg: (callback) => {
            console.log('[CALL] authNotice, ParseMsg');
            cryptHelper.ParseDecryptMsg({ msg: req.body }, callback);
        },

        CheckMsg: ['ParseMsg', (result, callback) => {
            console.log('[CALL] adNotice, CheckMsg');

            if( result.ParseMsg.MsgType == 'event'
                && (result.ParseMsg.Event == 'subscribe' || result.ParseMsg.Event == 'SCAN')
                && result.ParseMsg.EventKey ) {
                let userId = result.ParseMsg.EventKey;
                if( result.ParseMsg.Event == 'subscribe' ) {
                    userId = userId.slice(8);
                }
                wechatHelper.AdSubscribe({
                    userId: userId,
                    appid: req.params.appid,
                    openId: result.ParseMsg.FromUserName,
                    event: result.ParseMsg.Event
                }, (err, result) => {
                    if( !err ){
                        res.send('success');
                    }
                    callback(err);
                });
            } else if( result.ParseMsg.MsgType == 'text' ){
                systemConfigModel.GetWechatOpen(null, (err, wechatOpen) => {
                    if( !err
                        && wechatOpen.auto_reply == result.ParseMsg.Content ) {
                        const msgEncryptXml = cryptHelper.CreateEncryptMsg({
                            msg: {
                                ToUserName: result.ParseMsg.FromUserName,
                                FromUserName: result.ParseMsg.ToUserName,
                                CreateTime: Math.round((new Date()).getTime() / 1000),
                                MsgType: result.ParseMsg.MsgType,
                                Content: '[青橙]点击完成领取: ' + process.env.SIT_URL + '/subscribe/' + req.params.appid
                            },
                            token: process.env.WECHAT_OPEN_MESSAGE_TOKEN,
                            timestamp: req.query.timestamp,
                            nonce: req.query.nonce
                        });
                        res.send(msgEncryptXml);
                        callback(null);
                    } else {
                        res.send('success');
                        callback(null);
                    }
                });
            } else {
                res.send('success');
                callback(null);
            }
        }]

    }, (err, result) => {
        console.log('[CALLBACK] adNotice');
        if( err ) {
            res.send('success');
            next(err);
        }
    });
};

const adAuth = exports.adAuth = (req, res, next) => {
    console.log('[CALL] adAuth');

    wechatHelper.CreatePreAuthCode({ adId: req.query.adId }, (err, pre_auth_code) => {
        console.log('[CALLBACK] adAuth');
        if( err ) {
            return next(err);
        }
        const url = wechatApi.GetOpenAuthUrl({
            pre_auth_code: pre_auth_code,
            redirect_uri: 'http://' + req.headers.host + '/wechat/open/adAuthSuccess?pre_auth_code=' + pre_auth_code
        });
        res.render('page-button', { title: '授权公众号吸粉', message: '点击确认，并使用公众号运营者微信进行扫码授权。青橙承诺，授权仅用于吸粉投放和粉丝关注判断。', button: url });
    });

};

const adAuthSuccess = exports.adAuthSuccess = (req, res, next) => {
    console.log('[CALL] adAuthSuccess');

    wechatHelper.UpdateWechatMpAuthInfo({
        auth_code: req.query.auth_code,
        pre_auth_code: req.query.pre_auth_code
    }, (err, result) => {
        console.log('[CALLBACK] adAuthSuccess');
        if( err ) {
            next(err);
        }
        res.render('page', { title: '授权公众号吸粉', message: '授权成功！感谢使用青橙服务。' });
    });
}

