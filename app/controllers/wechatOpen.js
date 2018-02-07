

module.exports = {

  WECHAT_OPEN_ENCODE_KEY: process.env.WECHAT_OPEN_ENCODE_KEY,

  notice: async function (req, res, next) {
    console.log(__filename + '\n[CALL] notice, body:');
    console.log(req.body);

    try {
      const decryptMsg = await this.models.utils.crypt.decryptWechatMsg({
        msg: req.body,
        aesKey: this.WECHAT_OPEN_ENCODE_KEY,
      });

      switch( decryptMsg.InfoType ){
      case 'component_verify_ticket':
        await this.models.dbs.config.updateWechatOpenForce({
          ticket: decryptMsg.ComponentVerifyTicket,
        });
        break;
      case 'updateauthorized':
        await this.models.wechat.updateMpAuthInfo({
          auth_code: decryptMsg.AuthorizationCode,
          pre_auth_code: decryptMsg.PreAuthCode
        });
        break;
      case 'unauthorized':
        await this.models.dbs.ad.cancelAuth({ appid: decryptMsg.AuthorizerAppid });
        break;
      default:
        ;
      }

      return res.send('success');

    } catch(err) {
      console.error(__filename + '[CALL] notice, req.body:' + JSON.stringify(req.body) + ', err:' + err.message);
      return res.send('success');
    }
  },

};

