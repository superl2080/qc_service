

module.exports = {

  SIT_URL: process.env.SIT_URL,
  WECHAT_MP_APP_ID: process.env.WECHAT_MP_APP_ID,
  WECHAT_OPEN_APP_ID: process.env.WECHAT_OPEN_APP_ID,
  WECHAT_OPEN_ENCODE_KEY: process.env.WECHAT_OPEN_ENCODE_KEY,
  WECHAT_OPEN_MESSAGE_TOKEN: process.env.WECHAT_OPEN_MESSAGE_TOKEN,

  notice: async function (req, res, next) {
    try {
      const decryptMsg = await this.models.utils.crypt.decryptWechatMsg({
        msg: req.body,
        aesKey: this.WECHAT_OPEN_ENCODE_KEY,
      });

      if( decryptMsg.MsgType === 'event'
        && decryptMsg.Event === 'subscribe' ) {
        console.log(__filename + '\n[CALL] notice');
        console.log(decryptMsg);

        const openid = decryptMsg.FromUserName;
        const appid = req.params.appid;
        const ad = await this.models.dbs.ad.getByAppid({ appid: appid });
        const mpToken = await this.models.wechat.getMpToken({ ad: ad });

        if( appid === this.WECHAT_MP_APP_ID ){
          const userInfo = await this.models.apis.wechatMp.getUserInfo({
            mpToken: mpToken,
            openid: openid,
          });
          let user = await this.models.dbs.user.getByWechatForce({
            wechatId: openid,
          });
          user = await this.models.dbs.user.update({
            userId: user._id,
            wechatInfo: userInfo,
          });
          if( decryptMsg.EventKey ){
            const type = decryptMsg.EventKey.slice(8, 9);
            if( type === 'P') {
              const pointId = decryptMsg.EventKey.slice(9);
              const point = await this.models.dbs.point.getById({ pointId: pointId });
              if( point ){
                const msgEncryptXml = await this.models.utils.crypt.encryptWechatMsg({
                  aesKey: this.WECHAT_OPEN_ENCODE_KEY,
                  appId: this.WECHAT_OPEN_APP_ID,
                  msg: {
                    ToUserName: decryptMsg.FromUserName,
                    FromUserName: decryptMsg.ToUserName,
                    CreateTime: Math.round((new Date()).getTime() / 1000),
                    MsgType: 'text',
                    Content: '感谢关注青橙！首次领取请点击以下链接继续:' + this.SIT_URL + '/scan/point/' + pointId,
                  },
                  token: this.WECHAT_OPEN_MESSAGE_TOKEN,
                  timestamp: req.query.timestamp,
                  nonce: req.query.nonce,
                });
                return res.send(msgEncryptXml);
              }
            }
          }

        } else if( ad.wechatMpAuthInfo.verify_type === 0 ) {
          const userInfo = await this.models.apis.wechatMp.getUserInfo({
            mpToken: mpToken,
            openid: openid,
          });
          const users = await this.models.dbs.user.getByWechatInfo(userInfo);
          for( let user of users ){
            const order = await this.models.order.adSubscribe({
              user: user,
              appid: ad.wechatMpAuthInfo.appid,
              openid: openid,
            });
            if( order ) {
              user = await this.models.dbs.user.update({
                userId: user._id,
                wechatInfo: {
                  appid: appid,
                },
              });
              break;
            }
          }
        } else if( ad.state === 'DELIVER' ) {
          const msgEncryptXml = await this.models.utils.crypt.encryptWechatMsg({
            aesKey: this.WECHAT_OPEN_ENCODE_KEY,
            appId: this.WECHAT_OPEN_APP_ID,
            msg: {
              ToUserName: decryptMsg.FromUserName,
              FromUserName: decryptMsg.ToUserName,
              CreateTime: Math.round((new Date()).getTime() / 1000),
              MsgType: 'text',
              Content: '[青橙]点击完成领取:' + this.SIT_URL + '/subscribe/' + req.params.appid,
            },
            token: this.WECHAT_OPEN_MESSAGE_TOKEN,
            timestamp: req.query.timestamp,
            nonce: req.query.nonce,
          });
          return res.send(msgEncryptXml);
        }
      }
      return res.send('success');
      
    } catch(err) {
      console.error(__filename + '[CALL] notice, req.body:' + JSON.stringify(req.body) + ', err:' + err.message);
      return res.send('success');
    }
  },

};

