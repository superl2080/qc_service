
const express = require('express');


const router = module.exports.router = express.Router();


router.use('/', function(req, res, next) {
    console.log('[HTTP] ' + req.hostname + req.originalUrl);
    next();
});

