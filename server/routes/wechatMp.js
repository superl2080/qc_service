
const async = require('async');
const wechatHelper = require('../../imports/helpers/wechat');
const cryptHelper = require('../../imports/helpers/crypt');
const wechatApi = require('../../imports/api/wechat');


const oAuth = exports.oAuth = (req, res, next) => {
    console.log('[CALL] oAuth');

    let redirect_uri = 'http://' + req.headers.host + '/wechat/mp/oAuthSuccess?redirect_uri=' + cryptHelper.EncryptString(req.query.redirect_uri);
    const url = wechatApi.GetMpOAuthUrl({ redirect_uri: redirect_uri });

    res.redirect(url);
};

const oAuthSuccess = exports.oAuthSuccess = (req, res, next) => {
    console.log('[CALL] oAuthSuccess');

    async.auto({
        GetOpenToken: (callback) => {
            console.log('[CALL] oAuthSuccess, GetOpenToken');
            wechatHelper.GetOpenToken(null, callback);
        },

        MpOAuthGetOpenId: ['GetOpenToken', (result, callback) => {
            console.log('[CALL] oAuthSuccess, MpOAuthGetOpenId');
            wechatApi.MpOAuthGetOpenId({
                code: req.query.code,
                token: result.GetOpenToken
            }, callback);
        }]

    }, (err, result) => {
        console.log('[CALLBACK] oAuthSuccess');
        res.redirect(cryptHelper.DecryptString(req.query.redirect_uri) + '&openId=' + result.MpOAuthGetOpenId.openid);
        if( err ) {
            next(err);
        }
    });
}

