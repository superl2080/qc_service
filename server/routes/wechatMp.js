
const async = require('async');
const wechatHelper = require('../../imports/helpers/wechat');


const oAuth = exports.oAuth = (req, res, next) => {
    console.log('[CALL] oAuth');

    let redirect_uri = 'http://' + req.headers.host + '/wechat/mp/oAuthSuccess?redirect_uri=' + req.query.redirect_uri;
    redirect_uri += '&state=' + req.query.state;
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
        res.redirect(req.query.redirect_uri + '&openId=' + result.MpOAuthGetOpenId.openid);
        if( err ) {
            next(err);
        }
    });
}

