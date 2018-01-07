
const express = require('express');
const mongoose = require('mongoose');
const middleware = require('./middleware');
const wechatOpenRouter = require('./routes/wechatOpen');
const wechatMpRouter = require('./routes/wechatMp');
const serviceRouter = require('./routes/service');


mongoose.connect(process.env.MONGO_URL, {useMongoClient: true});
const router = exports.router = express.Router();


router.use('/', middleware.router);

router.post('/device/update', serviceRouter.deviceUpdate);
router.post('/channel/subscribe', serviceRouter.channelSubscribe);

router.post('/wechat/open/authNotice', wechatOpenRouter.authNotice);
router.post('/wechat/open/adNotice/:appid', wechatOpenRouter.adNotice);

router.get('/wechat/open/adAuth', wechatOpenRouter.adAuth);
router.get('/wechat/open/adAuthSuccess', wechatOpenRouter.adAuthSuccess);

router.get('/wechat/mp/oAuth', wechatMpRouter.oAuth);
router.get('/wechat/mp/oAuthSuccess', wechatMpRouter.oAuthSuccess);
