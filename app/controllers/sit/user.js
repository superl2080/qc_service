

module.exports = {

  SIT_URL: process.env.SIT_URL,
  SERVICE_URL: process.env.SERVICE_URL,
  WECHAT_MP_APP_ID: process.env.WECHAT_MP_APP_ID,
  WECHAT_OPEN_APP_ID: process.env.WECHAT_OPEN_APP_ID,

  wechatSubscribeMp: async function (req, res, next) {
    console.log(__filename + '\n[CALL] wechatSubscribeMp, query:');
    console.log(req.query);

    try {
      if( !req.query.redirect_uri
        || !req.query.appid ){
        throw new Error('redirect_uri or appid is empty');
      }

      await this.wechatLogin({
        redirect_uri: req.query.redirect_uri,
        cbk: '/sit/user/wechatSubscribeMpCbk',
        state: req.query.appid,
        res: res,
      });

    } catch(err) {
      console.error(__filename + '[CALL] wechatSubscribeMp, req.query:' + JSON.stringify(req.query) + ', err:' + err.message);
      return res.redirect(req.query.redirect_uri);
    }
  },

  wechatScanPoint: async function (req, res, next) {
    console.log(__filename + '\n[CALL] wechatScanPoint, query:');
    console.log(req.query);

    try {
      if( !req.query.redirect_uri
        || !req.query.pointId ){
        throw new Error('redirect_uri or pointId is empty');
      }

      await this.wechatLogin({
        redirect_uri: req.query.redirect_uri,
        cbk: '/sit/user/wechatScanPointCbk',
        state: req.query.pointId,
        res: res,
      });

    } catch(err) {
      console.error(__filename + '[CALL] wechatScanPoint, req.query:' + JSON.stringify(req.query) + ', err:' + err.message);
      return res.redirect(req.query.redirect_uri);
    }
  },

  wechatLogin: async function (param) {
    console.log(__filename + '\n[CALL] wechatLogin');

    const redirect_uri = await this.models.utils.crypt.encryptString({ str: param.redirect_uri });
    const new_redirect_uri = this.SERVICE_URL + param.cbk + '?redirect_uri=' + redirect_uri;
    const url = await this.models.apis.wechatMp.getOAuthUrl({
      openAppid: this.WECHAT_OPEN_APP_ID,
      mpAppid: this.WECHAT_MP_APP_ID,
      redirect_uri: new_redirect_uri,
      state: param.state,
    });
    return param.res.redirect(url);
  },

  wechatSubscribeMpCbk: async function (req, res, next) {
    console.log(__filename + '\n[CALL] wechatSubscribeMpCbk');
    console.log(req.query);

    try {
      if( !req.query.code
        || !req.query.redirect_uri
        || !req.query.state ){
        throw new Error('code is empty');
      }

      const openToken = await this.models.wechat.getOpenToken();
      const oAuthToken = await this.models.apis.wechatMp.getOAuthToken({
        openAppid: this.WECHAT_OPEN_APP_ID,
        openToken: openToken,
        mpAppid: this.WECHAT_MP_APP_ID,
        code: req.query.code,
      });
      const user = await this.models.dbs.user.getByWechatForce({ wechatId: oAuthToken.openid });

      const order = await this.models.order.adSubscribe({
        user: user,
        appid: req.query.state,
      });

      let redirect_uri = await this.models.utils.crypt.decryptString({ str: req.query.redirect_uri });
      if( redirect_uri.indexOf('?') >= 0 ) {
        redirect_uri += '&token=' + user._id.toString();
      } else {
        redirect_uri += '?token=' + user._id.toString();
      }
      if( order ) redirect_uri += '&orderId=' + order._id.toString();
      return res.redirect(redirect_uri);

    } catch(err) {
      console.error(__filename + '[CALL] wechatSubscribeMpCbk, req.query:' + JSON.stringify(req.query) + ', err:' + err.message);
      let redirect_uri = await this.models.utils.crypt.decryptString({ str: req.query.redirect_uri });
      return res.redirect(redirect_uri);
    }
  },

  wechatScanPointCbk: async function (req, res, next) {
    console.log(__filename + '\n[CALL] wechatScanPointCbk');
    console.log(req.query);

    try {
      if( !req.query.code
        || !req.query.redirect_uri
        || !req.query.state ){
        throw new Error('code is empty');
      }

      const openToken = await this.models.wechat.getOpenToken();
      const oAuthToken = await this.models.apis.wechatMp.getOAuthToken({
        openAppid: this.WECHAT_OPEN_APP_ID,
        openToken: openToken,
        mpAppid: this.WECHAT_MP_APP_ID,
        code: req.query.code,
      });
      let user = await this.models.dbs.user.getByWechatForce({ wechatId: oAuthToken.openid });

      const ad = await this.models.dbs.ad.getDefault();
      const mpToken = await this.models.wechat.getMpToken({ ad: ad });
      const point = await this.models.dbs.point.getById({ pointId: req.query.state });
      try {
        const userInfo = await this.models.apis.wechatMp.getUserInfo({
          mpToken: mpToken,
          openid: oAuthToken.openid,
        });
        user = await this.models.dbs.user.update({
          userId: user._id,
          wechatInfo: userInfo,
          tag: point.deployInfo.city,
        });
      } catch(err) {
        if( err.message === 'NOT_SUBSCRIBE' ){
          let redirect_uri = await this.models.utils.crypt.decryptString({ str: req.query.redirect_uri });
          if( redirect_uri.indexOf('?') >= 0 ) {
            redirect_uri += '&token=' + user._id.toString();
          } else {
            redirect_uri += '?token=' + user._id.toString();
          }
          redirect_uri += '&pointId=' + req.query.state;
          redirect_uri += '&subscribe=0';
          return res.redirect(redirect_uri);
        } else {
          throw err;
        }
      }

      const order = await this.models.order.create({
        user: user,
        point: point,
      });

      let redirect_uri = await this.models.utils.crypt.decryptString({ str: req.query.redirect_uri });
      if( redirect_uri.indexOf('?') >= 0 ) {
        redirect_uri += '&token=' + user._id.toString();
      } else {
        redirect_uri += '?token=' + user._id.toString();
      }
      if( order ) redirect_uri += '&orderId=' + order._id.toString();
      return res.redirect(redirect_uri);

    } catch(err) {
      console.error(__filename + '[CALL] wechatScanPointCbk, req.query:' + JSON.stringify(req.query) + ', err:' + err.message);
      let redirect_uri = await this.models.utils.crypt.decryptString({ str: req.query.redirect_uri });
      return res.redirect(redirect_uri);
    }
  },

};

