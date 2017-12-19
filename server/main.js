
const express = require('express');
const mongoose = require('mongoose');


mongoose.connect(process.env.MONGO_URL, {useMongoClient: true});
module.exports.router =  const router = express.Router();


router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
