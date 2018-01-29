'use strict';

import mongoose from 'mongoose';
import tests from './tests';
import controllers from './controllers';


module.exports = app => {

    mongoose.connect(process.env.MONGO_URL, { useMongoClient: true });

    if( process.env.NODE_ENV == 'test' ) {
        tests(app);
    }

    app.post('/channel/subscribe',              controllers.channel.subscribe);

    app.post('/device/update',                  controllers.device.update);

    app.get('/user/login/wechat',               controllers.user.loginWechat);
    app.get('/user/login/wechatCbk',            controllers.user.loginWechatCbk);
    app.get('/user/scan/wechat',                controllers.user.scanWechat);
    app.get('/user/scan/wechatCbk',             controllers.user.scanWechatCbk);

    app.get('/order',                           controllers.order.get);
    app.post('/order/prepay/wechat',            controllers.order.prepayWechat);

    app.post('/wechat/mp/notice/:appid',        controllers.wechatMp.notice);

    app.post('/wechat/open/notice',             controllers.wechatOpen.notice);
    app.get('/wechat/open/adAuth',              controllers.wechatOpen.adAuth);
    app.get('/wechat/open/adAuthCbk',           controllers.wechatOpen.adAuthCbk);

    app.post('/wechat/pay/notice',              controllers.wechatPay.notice);

};
