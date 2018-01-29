'use strict';

const models = require('../models')

const WECHAT_OPEN_APP_ID = process.env.WECHAT_OPEN_APP_ID;
const WECHAT_OPEN_ENCODE_KEY = process.env.WECHAT_OPEN_ENCODE_KEY;


module.exports = {

    notice: async (req, res, next) => {
        console.log(__filename + '\n[CALL] notice, body:');
        console.log(req.body);

        try {
            const decryptMsg = await models.utils.crypt.decryptWechatMsg({
                msg: req.body,
                aesKey: WECHAT_OPEN_ENCODE_KEY,
            });

            if( decryptMsg.MsgType == 'event'
                && (decryptMsg.Event == 'subscribe' || decryptMsg.Event == 'SCAN') ) {

                const openid = decryptMsg.FromUserName;
                const appid = req.params.appid;
                const ad = await models.dbs.ad.getByAppid({ appid: appid });
                const mpToken = await models.wechat.getMpToken({ ad: ad });
                const userInfo = await models.apis.wechatMp.getUserInfo({
                    mpToken: mpToken,
                    openid: openid,
                });
                let user = await models.dbs.user.getByWechatInfo(userInfo);
                if( user ){
                    user = await models.dbs.user.update({
                        userId: user._id,
                        appid: appid,
                    });

                    if( decryptMsg.Event == 'subscribe' ){
                        const order = await models.order.adSubscribe({
                            user: user,
                            ad: ad,
                            openid: openid,
                        });
                    }
                }
            }
            res.send('success');
            
        } catch(err) {
            console.error(__filename + '[CALL] notice, req.body:' + JSON.stringify(req.body) + ', err:' + err.message);
            res.send('success');
        }
    },

};

