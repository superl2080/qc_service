
const express = require('express');
const mongoose = require('mongoose');
const middleware = require('./middleware');
const wechatOpenRouter = require('./routes/wechatOpen');
const wechatMpRouter = require('./routes/wechatMp');
const deviceRouter = require('./routes/device');


mongoose.connect(process.env.MONGO_URL, {useMongoClient: true});
const router = exports.router = express.Router();


router.use('/', middleware.router);

router.post('/wechat/open/authNotice', wechatOpenRouter.authNotice);
router.post('/wechat/open/adNotice/:appid', wechatOpenRouter.adNotice);

router.post('/device/update', deviceRouter.update);

router.get('/wechat/open/adAuth', wechatOpenRouter.adAuth);
router.get('/wechat/open/adAuthSuccess', wechatOpenRouter.adAuthSuccess);

router.get('/wechat/mp/oAuth', wechatMpRouter.oAuth);
router.get('/wechat/mp/oAuthSuccess', wechatMpRouter.oAuthSuccess);
