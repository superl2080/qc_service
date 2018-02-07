

module.exports = {

  SERVICE_URL: process.env.SERVICE_URL,
  WECHAT_MP_APP_ID: process.env.WECHAT_MP_APP_ID,
  WECHAT_PAY_ID: process.env.WECHAT_PAY_ID,
  WECHAT_PAY_KEY: process.env.WECHAT_PAY_KEY,

  pre: async function (req, res, next) {
    console.log(__filename + '\n[CALL] pre, query:');
    console.log(req.query);

    try {
      if( !req.query.token
        || !req.query.pointId ){
        throw new Error('token or pointId is empty');
      }

      const ad = await this.models.dbs.ad.getDefault();
      const mpToken = await this.models.wechat.getMpToken({ ad: ad });
      const qrcode = await this.models.apis.wechatMp.createQrcode({
        mpToken: mpToken,
        scene_str: req.query.pointId,
      }); 
      const qrcodeUrl = await this.models.apis.wechatMp.getQrcodeUrl({ ticket: qrcode.ticket });

      return res.send({
        code: 0,
        data: {
          qrcodeUrl: qrcodeUrl,
        },
        message: 'pre success.',
      });
      
    } catch(err) {
      console.error(__filename + '[CALL] pre, req.query:' + JSON.stringify(req.query) + ', err:' + err.message);
      return res.send({
        code: 20100,
        data: {
          res: 'FAIL',
        },
        message: err.message,
      });
    }
  },

  get: async function (req, res, next) {
    console.log(__filename + '\n[CALL] get, query:');
    console.log(req.query);

    try {
      if( !req.query.token
        || !req.query.orderId ){
        throw new Error('token or orderId is empty');
      }

      const order = await this.models.dbs.order.getById({ orderId: req.query.orderId });
      if( !order ){
        throw new Error('orderId is error');
      }

      const user = await this.models.dbs.user.getById({ userId: req.query.token });
      if( !user
        || order.userId.toString() !== user._id.toString() ){
        throw new Error('token is error');
      }

      return res.send({
        code: 0,
        data: order,
        message: 'get success.',
      });
      
    } catch(err) {
      console.error(__filename + '[CALL] get, req.query:' + JSON.stringify(req.query) + ', err:' + err.message);
      return res.send({
        code: 20101,
        data: {
          res: 'FAIL',
        },
        message: err.message,
      });
    }
  },

  wechatPrepay: async function (req, res, next) {
    console.log(__filename + '\n[CALL] wechatPrepay, body:');
    console.log(req.body);

    try {
      if( !req.body.token
        || !req.body.orderId
        || !req.body.body
        || !req.body.spbill_create_ip ){
        throw new Error('token or orderId or body or spbill_create_ip is empty');
      }

      const order = await this.models.dbs.order.getById({ orderId: req.body.orderId });
      if( !order ){
        throw new Error('orderId is error');
      }

      const user = await this.models.dbs.user.getById({ userId: req.body.token });
      if( !user
        || order.userId.toString() !== user._id.toString() ){
        throw new Error('token is error');
      }
      const prepay = await this.models.apis.wechatPay.prepay({
        body: req.body.body,
        notify_url: this.SERVICE_URL + '/wechat/pay/notice',
        openid: user.authId.wechatId,
        spbill_create_ip: req.body.spbill_create_ip,
        out_trade_no: order._id.toString(),
        total_fee: order.price,
        mpAppid: this.WECHAT_MP_APP_ID,
        payId: this.WECHAT_PAY_ID,
        payKey: this.WECHAT_PAY_KEY,
      });

      return res.send({
        code: 0,
        data: prepay,
        message: 'wechatPrepay success.',
      });
      
    } catch(err) {
      console.error(__filename + '[CALL] wechatPrepay, req.body:' + JSON.stringify(req.body) + ', err:' + err.message);
      return res.send({
        code: 20102,
        data: {
          res: 'FAIL',
        },
        message: err.message,
      });
    }
  },

};

