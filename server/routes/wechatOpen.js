
const async = require('async');
const wechatHelper = require('../../imports/helpers/wechat');
const cryptHelper = require('../../imports/helpers/crypt');

const WECHAT_OPEN_APP_ID = process.env.WECHAT_OPEN_APP_ID;


const authNotice = exports.authNotice = (req, res, next) => {


    async.auto({
        pre: (callback) => {
            console.log('[CALL] authNotice, pre');
            callback(null, {
                req: req,
                res: res,
                next: next
            });
        },

        parseXml: ['pre', (result, callback) => {
            console.log('[CALL] authNotice, parseXml');
            cryptHelper.ParseJsonFromXml(result.pre.req.body, callback);
        }],

        decrypt: ['parseXml', (result, callback) => {
            console.log('[CALL] authNotice, decrypt');
            const decryptData = wechatHelper.Decrypt(result.parseXml.xml.Encrypt[0]);
            cryptHelper.ParseJsonFromXml(decryptData, callback);
        }],

        checkInfo: ['decrypt', (result, callback) => {
            switch( result.decrypt.xml.InfoType[0] ){
            case 'component_verify_ticket':
                console.log('[CALL] authNotice, checkTicket');
                wechatHelper.UpdateTicket(result.decrypt.xml.ComponentVerifyTicket[0], callback);
                break;
            case 'authorized':
            case 'updateauthorized':
                console.log('[CALL] authNotice, authorized/updateauthorized');
                wechatHelper.UpdateWechatMpAuthInfo({
                    appid: result.decrypt.xml.AuthorizerAppid[0],
                    auth_Code: result.decrypt.xml.AuthorizationCode[0],
                    pre_auth_code: result.decrypt.xml.PreAuthCode[0]
                }, callback);
                break;
            case 'unauthorized':
                console.log('[CALL] authNotice, unauthorized');
                wechatHelper.CancelWechatMpAuthInfo({
                    appid: result.decrypt.xml.AuthorizerAppid[0]
                }, callback);
                break;
            default:
                callback(null);
            }
        }]

    }, (err, results) => {
        console.log('[CALLBACK] authNotice');
        results.pre.res.send('success');
        if( err ) {
            results.pre.next(err);
        }
    });
};


const adNotice = exports.adNotice = (req, res, next) => {

    async.auto({
        pre: (callback) => {
            console.log('[CALL] adNotice, pre');
            callback(null, {
                req: req,
                res: res,
                next: next
            });
        },

        parseXml: ['pre', (result, callback) => {
            console.log('[CALL] adNotice, parseXml');
            cryptHelper.ParseJsonFromXml(result.pre.req.body, callback);
        }],

        decrypt: ['parseXml', (result, callback) => {
            console.log('[CALL] adNotice, decrypt');
            const decryptData = wechatHelper.Decrypt(result.parseXml.xml.Encrypt[0]);
            cryptHelper.ParseJsonFromXml(decryptData, callback);
        }],

        checkTicket: ['decrypt', (result, callback) => {
            console.log('[CALL] adNotice, checkTicket');
/*
            if( result2.xml.MsgType == 'event'
                && (result2.xml.Event[0] == 'subscribe' || result2.xml.Event[0] == 'SCAN')
                && result2.xml.EventKey[0] ) {
                var option = {
                    appid: req.params.appid
                };
                if( result2.xml.Event == 'subscribe' ) {
                    option.userId = result2.xml.EventKey[0].slice(8);
                } else {
                    option.userId = result2.xml.EventKey[0];
                }
                console.log('received option: ');
                console.log(option);
                user.finishAd(option, function (err, userInfo) {
                    if( !err && userInfo ){
                        ad.finishAd(option, function (err, adInfo) {
                            if( !err && adInfo ) {
                                option.adId = adInfo._id;
                                option.aderId = adInfo.aderId;
                                ader.finishAd(option, function (err, aderInfo) {
                                    if( !err && aderInfo ) {
                                        option.income = aderInfo.income;
                                        adOrder.insert(option, function (err, aderInfo) {});
                                        deviceOrder.finishAd(option, function (err, deviceOrderInfo) {
                                            option.deviceOrderInfo = deviceOrderInfo;
                                            if(params.deviceOrderInfo &&
                                                params.deviceOrderInfo.state == 'SUCCESS') {
                                                TakeDeviceItem(option, function (err) {});
                                                if(takeRes == 'SUCCESS') {
                                                    deviceOrder.finishTake(params, function (err, deviceOrderInfo) {
                                                        callback(err);
                                                    });
                                                }
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            }*/
        }]

    }, (err, results) => {
        console.log('[CALLBACK] adNotice');
        results.pre.res.send('');
        if( err ) {
            results.pre.next(err);
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
        let redirect_uri = encodeURIComponent('http://' + req.headers.host + '/wechat/open/adAuthSuccess');
        let uri = 'https://mp.weixin.qq.com/cgi-bin/componentloginpage?component_appid=' + WECHAT_OPEN_APP_ID;
        uri += '&pre_auth_code=' + pre_auth_code;
        uri += '&redirect_uri=' + redirect_uri;
        res.redirect(uri);
    });

};

const adAuthSuccess = exports.adAuthSuccess = (req, res, next) => {
    console.log('[CALL] adAuthSuccess');

    res.render('index', { title: '授权成功', message: '感谢使用青橙服务！' });
}

