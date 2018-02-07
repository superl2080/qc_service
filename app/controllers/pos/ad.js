

module.exports = {

  WECHAT_OPEN_APP_ID: process.env.WECHAT_OPEN_APP_ID,

  wechatAuth: async function (req, res, next) {
    console.log(__filename + '\n[CALL] wechatAuth, query:');
    console.log(req.query);
    try {
      if( !req.query.adId ){
        throw new Error('adId is empty');
      }

      const openToken = await this.models.wechat.getOpenToken();
      const preAuthCode = await this.models.apis.wechatOpen.createPreAuthCode({
        openAppid: this.WECHAT_OPEN_APP_ID,
        openToken: openToken,
      });
      await this.models.dbs.ad.update({
        adId: req.query.adId,
        wechatMpAuthInfo: {
          pre_auth_code: preAuthCode.pre_auth_code,
        },
      });
      const url = await this.models.apis.wechatOpen.getMpAuthUrl({
        openAppid: this.WECHAT_OPEN_APP_ID,
        pre_auth_code: preAuthCode.pre_auth_code,
        redirect_uri: 'http://' + req.headers.host + '/pos/ad/wechatAuthCbk?pre_auth_code=' + preAuthCode.pre_auth_code,
      });
      return res.render('page-button', {
        title: '授权公众号吸粉',
        message: '点击确认，并使用公众号运营者微信进行扫码授权。青橙承诺，授权仅用于吸粉投放和粉丝关注判断。',
        button: url,
      });

    } catch(err) {
      console.error(__filename + '[CALL] wechatAuth, req.query:' + JSON.stringify(req.query) + ', err:' + err.message);
      return next(err);
    }
  },

  wechatAuthCbk: async function (req, res, next) {
    console.log(__filename + '\n[CALL] wechatAuthCbk, query:');
    console.log(req.query);
    try {
      if( !req.query.auth_code
        || !req.query.pre_auth_code ){
        throw new Error('auth_code or pre_auth_code is empty');
      }

      await this.models.wechat.updateMpAuthInfo({
        auth_code: req.query.auth_code,
        pre_auth_code: req.query.pre_auth_code,
      });
      return res.render('page', {
        title: '授权公众号吸粉',
        message: '授权成功！感谢使用青橙服务。',
      });
      
    } catch(err) {
      console.error(__filename + '[CALL] wechatAuthCbk, req.query:' + JSON.stringify(req.query) + ', err:' + err.message);
      return next(err);
    }
  },

};

