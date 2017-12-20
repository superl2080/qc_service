
const express = require('express');
const mongoose = require('mongoose');


const router = module.exports.router = express.Router();


router.get('/', function(req, res, next) {
    console.log('[GET] ' + req.hostname + req.originalUrl);
	next();
});

router.post('/', function(req, res, next) {
    console.log('[POST] ' + req.hostname + req.originalUrl);
	next();
});
