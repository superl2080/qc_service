
const express = require('express');
const mongoose = require('mongoose');
const middleware = require('./middleware');
const wechatOpenRouter = require('./routes/wechatOpen');


mongoose.connect(process.env.MONGO_URL, {useMongoClient: true});
const router = exports.router = express.Router();


router.use('/', middleware.router);

router.post('/wechat/open/authNotice', wechatOpenRouter.authNotice);
router.post('/wechat/open/adNotice/:appid', wechatOpenRouter.adNotice);
router.get('/wechat/open/adAuth', wechatOpenRouter.adAuth);
router.get('/wechat/open/adAuthSuccess', wechatOpenRouter.adAuthSuccess);
