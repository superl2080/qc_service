

module.exports = {

  notice: async function (req, res, next) {
    console.log(__filename + '\n[CALL] notice, body:');
    console.log(req.body);

    try {
      const json = await this.models.utils.request.getJsonFromXml({ xml: req.body });
      if( json.return_code !== 'SUCCESS'
        || json.result_code !== 'SUCCESS' ){
        throw new Error('return_code or result_code is error');
      }

      const order = await this.models.order.finishPay({
        orderId: json.out_trade_no,
        payout: json.total_fee,
        transaction_id: json.transaction_id,
      });

      const xml = await this.models.utils.request.getXmlFromJsonForceCData({
        json: {
          return_code: 'SUCCESS',
          return_msg: 'OK',
        },
      });
      return res.send(xml);
      
    } catch(err) {
      console.error(__filename + '[CALL] notice, req.body:' + JSON.stringify(req.body) + ', err:' + err.message);
      const xml = await this.models.utils.request.getXmlFromJsonForceCData({
        json: {
          return_code: 'SUCCESS',
          return_msg: 'OK',
        },
      });
      return res.send(xml);
    }
  },

};

