
const mongoose = require('mongoose');

const ObjectId = mongoose.Schema.Types.ObjectId;

const orderSchema = new mongoose.Schema({

  createDate:               { $type: Date,                required: true },

  userId:                   { $type: ObjectId,            required: true },
  pointId:                  { $type: ObjectId,            required: true },
  partnerId:                { $type: ObjectId,            required: true },
  item:                     { $type: String,              required: true },
  city:                     { $type: String,              required: true },
  price:                    { $type: Number,              required: true },
  state:                    { $type: String,              default: 'OPEN' }, //'OPEN', 'SUCCESS', 'FAIL', 'CANCEL'

  adInfo: {
    adId:                   ObjectId,
    aderId:                 ObjectId,
    qrcode_url:             String,
    appid:                  String,
    payout:                 Number,
  },

  payInfo: {
    endDate:                Date,
    payout:                 Number,
    type:                   String, //'AD', 'PAY'
    
    openid:                 String,

    channel:                String, //'WECHAT'
    transaction_id:         String,
  },
}, { typeKey: '$type' });

const orderModel = mongoose.model('order', orderSchema);


module.exports = {

  getById: async function (param) {
    console.log(__filename + '\n[CALL] getById, param:');
    console.log(param);

    const order = await orderModel.findById(param.orderId).exec();

    console.log('[CALLBACK] getById, result:');
    console.log(order);
    return order;
  },

  getByUserAppid: async function (param) {
    console.log(__filename + '\n[CALL] getByUserAppid, param:');
    console.log(param);

    const order = await orderModel.findOne({
      userId: param.userId,
      'adInfo.appid': param.appid,
      state: 'OPEN',
    }).exec();

    console.log('[CALLBACK] getByUserAppid, result:');
    console.log(order);
    return order;
  },

  create: async function (param) {
    console.log(__filename + '\n[CALL] create, param:');
    console.log(param);

    if( param.point.state !== 'DEPLOY' 
      && param.point.state !== 'TEST' ){
      throw new Error('Point is not ok');
    }

    const order = await orderModel.create({ 
      createDate: new Date(),
      userId: param.user._id,
      pointId: param.point._id,
      partnerId: param.point.partnerId,
      item: param.point.deployInfo.item,
      city: param.point.deployInfo.city,
      price: param.point.deployInfo.price,
    });

    console.log('[CALLBACK] create, result:');
    console.log(order);
    return order;
  },

  update: async function (param) {
    console.log(__filename + '\n[CALL] update, param:');
    console.log(param);
    
    let order = await orderModel.findById(param.orderId).exec();
    if( !order ) {
      throw new Error('Can not find order');
    }

    if( param.state ) order.state = param.state;
    if( param.adInfo ){
      if( param.adInfo.adId ) order.adInfo.adId = param.adInfo.adId;
      if( param.adInfo.aderId ) order.adInfo.aderId = param.adInfo.aderId;
      if( param.adInfo.qrcode_url ) order.adInfo.qrcode_url = param.adInfo.qrcode_url;
      if( param.adInfo.appid ) order.adInfo.appid = param.adInfo.appid;
      if( param.adInfo.payout !== undefined ) order.adInfo.payout = param.adInfo.payout;
    }
    if( param.payInfo ){
      if( param.payInfo.type ) order.payInfo.type = param.payInfo.type;
      if( param.payInfo.endDate ) order.payInfo.endDate = param.payInfo.endDate;
      if( param.payInfo.openid ) order.payInfo.openid = param.payInfo.openid;
      if( param.payInfo.payout !== undefined ) order.payInfo.payout = param.payInfo.payout;
      if( param.payInfo.channel ) order.payInfo.channel = param.payInfo.channel;
      if( param.payInfo.transaction_id ) order.payInfo.transaction_id = param.payInfo.transaction_id;
    }
    await order.save();

    console.log('[CALLBACK] update, result:');
    console.log(order);
    return order;
  },

  cancel: async function (param) {
    console.log(__filename + '\n[CALL] cancel, param:');
    console.log(param);

    let orders;
    if( param.user ){
      orders = await orderModel.find({
        userId: param.user._id,
        state: { $in: ['OPEN'] },
      }).exec();
    } else if( param.expiresInDate ){
      orders = await orderModel.find({
        createDate: { $lt: param.expiresInDate },
        state: { $in: ['OPEN'] },
      }).exec();
    }

    for( let order of orders ){
      order.state = 'CANCEL';
      await order.save();
      if( order.adInfo
        && order.adInfo.adId ){
        await this.models.dbs.ad.cancelDeliver({ adId: order.adInfo.adId });
      }
    }

    console.log('[CALLBACK] cancel, result:');
    console.log(orders);
    return orders;
  },

};

