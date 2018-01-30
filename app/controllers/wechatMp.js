

module.exports = {

    WECHAT_MP_APP_ID: process.env.WECHAT_MP_APP_ID,
    WECHAT_OPEN_ENCODE_KEY: process.env.WECHAT_OPEN_ENCODE_KEY,

    notice: async function (req, res, next) {
        console.log(__filename + '\n[CALL] notice, body:');
        console.log(req.body);

        try {
            const decryptMsg = await this.models.utils.crypt.decryptWechatMsg({
                msg: req.body,
                aesKey: this.WECHAT_OPEN_ENCODE_KEY,
            });

            if( decryptMsg.MsgType == 'event'
                && (decryptMsg.Event == 'subscribe' || decryptMsg.Event == 'SCAN') ) {

                const openid = decryptMsg.FromUserName;
                const appid = req.params.appid;
                const ad = await this.models.dbs.ad.getByAppid({ appid: appid });
                const mpToken = await this.models.wechat.getMpToken({ ad: ad });
                const userInfo = await this.models.apis.wechatMp.getUserInfo({
                    mpToken: mpToken,
                    openid: openid,
                });
                let user = await this.models.dbs.user.getByWechatInfo(userInfo);
                if( user ){
                    user = await this.models.dbs.user.update({
                        userId: user._id,
                        wechatInfo: {
                            appid: appid,
                        },
                    });

                    if( decryptMsg.Event == 'subscribe'
                        || appid == this.WECHAT_MP_APP_ID ){
                        const order = await this.models.order.adSubscribe({
                            user: user,
                            appid: ad.wechatMpAuthInfo.appid,
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

