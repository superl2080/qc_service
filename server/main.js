
import express from 'express';
import mongoose from 'mongoose';

mongoose.connect(process.env.MONGO_URL, {useMongoClient: true});
export const mainRouter = express.Router();


mainRouter.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
