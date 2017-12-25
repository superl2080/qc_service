
const express = require('express');
const mongoose = require('mongoose');
const middleware = require('./middleware');
const test = require('./test');
const routeWechat = require('./routes/wechat');


mongoose.connect(process.env.MONGO_URL, {useMongoClient: true});
const router = exports.router = express.Router();


router.use('/', middleware.router);

if( process.env.NODE_ENV == 'test' ) {
    router.use('/test', test.router);
}

router.post('/wechat/open/notice', routeWechat.openNotice);
