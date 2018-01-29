'use strict';

import models from '../models';

const WECHAT_MP_APP_ID = process.env.WECHAT_MP_APP_ID;
const WECHAT_OPEN_APP_ID = process.env.WECHAT_OPEN_APP_ID;


module.exports = {

    loginWechat: async (req, res, next) => {
        console.log(__filename + '\n[CALL] loginWechat, query:');
        console.log(req.query);

        try {
            if( !req.query.redirect_uri ){
                throw new Error('redirect_uri is empty');
            }

            const redirect_uri = await models.utils.crypt.encryptString({ str: req.query.redirect_uri });
            const new_redirect_uri = 'http://' + req.headers.host + '/user/login/wechatCbk?redirect_uri=' + redirect_uri;
            const url = await models.apis.wechatMp.getOAuthUrl({
                openAppid: WECHAT_OPEN_APP_ID,
                mpAppid: WECHAT_MP_APP_ID,
                redirect_uri: new_redirect_uri,
            });

            res.redirect(url);

        } catch(err) {
            console.error(__filename + '[CALL] loginWechat, req.query:' + JSON.stringify(req.query) + ', err:' + err.message);
            res.redirect(req.query.redirect_uri);
        }
    },

    loginWechatCbk: async (req, res, next) => {
        console.log(__filename + '\n[CALL] loginWechatCbk');
        console.log(req.query);

        try {
            if( !req.query.code
                || !req.query.redirect_uri ){
                throw new Error('code is empty');
            }

            const openToken = await models.wechat.getOpenToken();
            const oAuthToken = await models.apis.wechatMp.getOAuthToken({
                openAppid: WECHAT_OPEN_APP_ID,
                openToken: openToken,
                mpAppid: WECHAT_MP_APP_ID,
                code: req.query.code,
            });
            const oAuthUserInfo = await models.apis.wechatMp.getOAuthUserInfo({
                token: oAuthToken.access_token,
                openid: oAuthToken.openid,
            });
            let user = await models.dbs.user.getByWechatForce({
                wechatId: oAuthToken.openid,
            });
            user = await models.dbs.user.update({
                userId: user._id,
                wechatInfo: oAuthUserInfo,
            });

            let redirect_uri = await models.utils.crypt.decryptString({ str: req.query.redirect_uri })
            if( redirect_uri.indexOf('?') >= 0 ) {
                redirect_uri += '&token=' + user._id.toString();
            } else {
                redirect_uri += '?token=' + user._id.toString();
            }
            res.redirect(redirect_uri);

        } catch(err) {
            console.error(__filename + '[CALL] loginWechat, req.query:' + JSON.stringify(req.query) + ', err:' + err.message);
            let redirect_uri = await models.utils.crypt.decryptString({ str: req.query.redirect_uri })
            res.redirect(redirect_uri);
        }
    },

    scanWechat: async (req, res, next) => {
        console.log(__filename + '\n[CALL] scanWechat, query:');
        console.log(req.query);

        try {
            if( !req.query.redirect_uri
                || !req.query.pointId ){
                throw new Error('redirect_uri or pointId is empty');
            }

            const redirect_uri = await models.utils.crypt.encryptString({ str: req.query.redirect_uri });
            const new_redirect_uri = 'http://' + req.headers.host + '/user/login/wechatCbk?redirect_uri=' + redirect_uri;
            const url = await models.apis.wechatMp.getOAuthUrl({
                openAppid: WECHAT_OPEN_APP_ID,
                mpAppid: WECHAT_MP_APP_ID,
                redirect_uri: new_redirect_uri,
                state: req.query.pointId.toString(),
            });

            res.redirect(url);

        } catch(err) {
            console.error(__filename + '[CALL] scanWechat, req.query:' + JSON.stringify(req.query) + ', err:' + err.message);
            res.redirect(req.query.redirect_uri);
        }
    },

    scanWechatCbk: async (req, res, next) => {
        console.log(__filename + '\n[CALL] scanWechatCbk');
        console.log(req.query);

        try {
            if( !req.query.code
                || !req.query.redirect_uri
                || !req.query.state ){
                throw new Error('code is empty');
            }

            const openToken = await models.wechat.getOpenToken();
            const oAuthToken = await models.apis.wechatMp.getOAuthToken({
                openAppid: WECHAT_OPEN_APP_ID,
                openToken: openToken,
                mpAppid: WECHAT_MP_APP_ID,
                code: req.query.code,
            });
            const oAuthUserInfo = await models.apis.wechatMp.getOAuthUserInfo({
                token: oAuthToken.access_token,
                openid: oAuthToken.openid,
            });
            let user = await models.dbs.user.getByWechatForce({
                wechatId: oAuthToken.openid,
            });
            user = await models.dbs.user.update({
                userId: user._id,
                wechatInfo: oAuthUserInfo,
            });
            const point = await models.dbs.point.getById({ pointId: req.query.state });
            const order = await models.order.create({
                user: user,
                point: point,
            });

            let redirect_uri = await models.utils.crypt.decryptString({ str: req.query.redirect_uri })
            if( redirect_uri.indexOf('?') >= 0 ) {
                redirect_uri += '&token=' + user._id.toString();
            } else {
                redirect_uri += '?token=' + user._id.toString();
            }
            redirect_uri += '?orderId=' + order._id.toString();
            res.redirect(redirect_uri);

        } catch(err) {
            console.error(__filename + '[CALL] loginWechat, req.query:' + JSON.stringify(req.query) + ', err:' + err.message);
            let redirect_uri = await models.utils.crypt.decryptString({ str: req.query.redirect_uri })
            res.redirect(redirect_uri);
        }
    },

};

