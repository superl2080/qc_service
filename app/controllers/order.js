'use strict';

const models = require('../models')

const SERVICE_URL = process.env.SERVICE_URL;
const WECHAT_MP_APP_ID = process.env.WECHAT_MP_APP_ID;
const WECHAT_PAY_ID = process.env.WECHAT_PAY_ID;
const WECHAT_PAY_KEY = process.env.WECHAT_PAY_KEY;


module.exports = {

    get: async (req, res, next) => {
        console.log(__filename + '\n[CALL] get, query:');
        console.log(req.query);

        try {
            if( !req.query.token
                || !req.query.orderId ){
                throw new Error('token or orderId is empty');
            }

            const order = await models.dbs.order.getByAppid({ orderId: req.query.orderId });
            if( !order ){
                throw new Error('orderId is error');
            }

            const user = await models.dbs.user.getById({ userId: req.query.token });
            if( !user
                || order.userId != user._id ){
                throw new Error('token is error');
            }

            res.send({
                code: 0,
                data: order,
                message: 'get success.',
            });
            
        } catch(err) {
            console.error(__filename + '[CALL] get, req.query:' + JSON.stringify(req.query) + ', err:' + err.message);
            res.send({
                code: 20003,
                data: {
                    res: 'FAIL',
                },
                message: err.message,
            });
        }
    },

    prepayWechat: async (req, res, next) => {
        console.log(__filename + '\n[CALL] prepayWechat, body:');
        console.log(req.body);

        try {
            if( !req.body.token
                || !req.body.orderId
                || !req.body.body
                || !req.body.spbill_create_ip ){
                throw new Error('token or orderId or body or spbill_create_ip is empty');
            }

            const order = await models.dbs.order.getByAppid({ orderId: req.body.orderId });
            if( !order ){
                throw new Error('orderId is error');
            }

            const user = await models.dbs.user.getById({ userId: req.body.token });
            if( !user
                || order.userId != user._id ){
                throw new Error('token is error');
            }
            const prepay = await models.apis.wechatPay.prepay({
                body: req.body.body,
                notify_url: SERVICE_URL + '/wechat/pay/notice',
                openid: user.authId.wechatId,
                spbill_create_ip: req.body.spbill_create_ip,
                out_trade_no: order._id.toString(),
                total_fee: order.price,
                mpAppid: WECHAT_MP_APP_ID,
                payId: WECHAT_PAY_ID,
                payKey: WECHAT_PAY_KEY,
            });

            res.send({
                code: 0,
                data: prepay,
                message: 'prepayWechat success.',
            });
            
        } catch(err) {
            console.error(__filename + '[CALL] prepayWechat, req.body:' + JSON.stringify(req.body) + ', err:' + err.message);
            res.send({
                code: 20004,
                data: {
                    res: 'FAIL',
                },
                message: err.message,
            });
        }
    },

};

