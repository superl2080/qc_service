'use strict';

import models from '../models';

const WECHAT_OPEN_APP_ID = process.env.WECHAT_OPEN_APP_ID;
const WECHAT_OPEN_ENCODE_KEY = process.env.WECHAT_OPEN_ENCODE_KEY;


module.exports = {

    notice: async (req, res, next) => {
        console.log(__filename + '\n[CALL] notice, body:');
        console.log(req.body);

        try {
            const json = await models.utils.request.getJsonFromXml({ xml: req.body });
            if( json.return_code != 'SUCCESS'
                || json.result_code != 'SUCCESS' ){
                throw new Error('return_code or result_code is error');
            }

            const order = await models.order.finishPay({
                orderId: json.out_trade_no,
                payout: json.total_fee,
                transaction_id: json.transaction_id,
            });

            const xml = await models.utils.request.getXmlFromJsonForceCData({
                json: {
                    return_code: 'SUCCESS',
                    return_msg: 'OK',
                },
            });
            res.send(xml);
            
        } catch(err) {
            console.error(__filename + '[CALL] notice, req.body:' + JSON.stringify(req.body) + ', err:' + err.message);
            const xml = await models.utils.request.getXmlFromJsonForceCData({
                json: {
                    return_code: 'SUCCESS',
                    return_msg: 'OK',
                },
            });
            res.send(xml);
        }
    },

};

