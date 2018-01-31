

module.exports = {

    SIT_URL: process.env.SIT_URL,
    WECHAT_MP_APP_ID: process.env.WECHAT_MP_APP_ID,
    WECHAT_OPEN_APP_ID: process.env.WECHAT_OPEN_APP_ID,
    WECHAT_OPEN_ENCODE_KEY: process.env.WECHAT_OPEN_ENCODE_KEY,
    WECHAT_OPEN_MESSAGE_TOKEN: process.env.WECHAT_OPEN_MESSAGE_TOKEN,

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
                const users = await this.models.dbs.user.getByWechatInfo(userInfo);
                for( let user of users ){
                    user = await this.models.dbs.user.update({
                        userId: user._id,
                        wechatInfo: {
                            appid: appid,
                        },
                    });

                    if( decryptMsg.Event == 'subscribe' ){
                        const order = await this.models.order.adSubscribe({
                            user: user,
                            appid: ad.wechatMpAuthInfo.appid,
                            openid: openid,
                        });
                    }
                }
            } else if( decryptMsg.MsgType == 'text' ){
                const otherConfig = await this.models.dbs.config.getOther();
                if( otherConfig.auto_reply == decryptMsg.Content ) {
                    const msgEncryptXml = await this.models.utils.crypt.encryptWechatMsg({
                        aesKey: this.WECHAT_OPEN_ENCODE_KEY,
                        appId: this.WECHAT_OPEN_APP_ID,
                        msg: {
                            ToUserName: decryptMsg.FromUserName,
                            FromUserName: decryptMsg.ToUserName,
                            CreateTime: Math.round((new Date()).getTime() / 1000),
                            MsgType: 'news',
                            ArticleCount: 1,
                            Articles: {
                                item: {
                                    Title: '青橙',
                                    Description: '点击完成领取',
                                    PicUrl: this.SIT_URL + '/images/product-activity.jpg',
                                    Url: this.SIT_URL + '/subscribe/' + req.params.appid,
                                },
                            },/*
                            MsgType: 'text',
                            Content: '[青橙]点击完成领取:' + this.SIT_URL + '/subscribe/' + req.params.appid,*/
                        },
                        token: this.WECHAT_OPEN_MESSAGE_TOKEN,
                        timestamp: req.query.timestamp,
                        nonce: req.query.nonce,
                    });
                    return res.send(msgEncryptXml);
                }
            }
            res.send('success');
            
        } catch(err) {
            console.error(__filename + '[CALL] notice, req.body:' + JSON.stringify(req.body) + ', err:' + err.message);
            res.send('success');
        }
    },

};

