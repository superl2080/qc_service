
const mongoose = require('mongoose');

const ObjectId = mongoose.Schema.Types.ObjectId;

const adSchema = new mongoose.Schema({

  createDate:               { $type: Date,                required: true },

  aderId:                   { $type: ObjectId,            required: true },
  type:                     { $type: String,              required: true }, //'WECHAT_MP_AUTH', 'WECHAT_MP_API'
  state:                    { $type: String,              default: 'CREATE' }, //'CREATE', 'OPEN', 'DEFAULT', 'DELIVER', 'CANCEL'

  deliverInfo: {
    payout:                 { $type: Number,              required: true },
    priority:               { $type: Number,              default: 10 },
    count:                  Number,
    partnerType:            { $type: String,              default: 'ALL' }, //'ALL', 'WHITE', 'BLACK'
    partnerIds:             [ ObjectId ],
    userType:               { $type: String,              default: 'ALL' }, //'ALL', 'WHITE', 'BLACK'
    userTags:               [ String ],
  },

  wechatMpAuthInfo: {
    pre_auth_code:          String,
    appid:                  String,
    user_name:              String,
    qrcode_url:             String,
    access_token:           String,
    expires_in:             Date,
    refresh_token:          String,
    nick_name:              String,
    head_img:               String,
    service_type:           Number,
    verify_type:            Number,
  },

  wechatMpApiInfo: {
    channelId:    ObjectId,
  },
}, { typeKey: '$type' });

const adModel = mongoose.model('ad', adSchema);


module.exports = {

  getById: async function (param) {
    console.log(__filename + '\n[CALL] getById, param:');
    console.log(param);

    const ad = await adModel.findById(param.adId).exec();

    console.log('[CALLBACK] getById, result:');
    console.log(ad);
    return ad;
  },

  getByAppid: async function (param) {
    console.log(__filename + '\n[CALL] getByAppid, param:');
    console.log(param);

    const ad = await adModel.findOne({ 'wechatMpAuthInfo.appid' : param.appid }).exec();

    console.log('[CALLBACK] getById, result:');
    console.log(ad);
    return ad;
  },

  getDefault: async function (param) {
    console.log(__filename + '\n[CALL] getDefault, param:');
    console.log(param);

    const ad = await adModel.findOne({ state: 'DEFAULT' }).exec();

    console.log('[CALLBACK] getDefault, result:');
    console.log(ad);
    return ad;
  },

  getDeliverAds: async function (param) {
    console.log(__filename + '\n[CALL] getDeliverAds, param:');
    console.log(param);

    const ads = await adModel.find({ state: 'DELIVER' })
      .gt('deliverInfo.count', 0)
      .nin('wechatMpAuthInfo.appid', param.user.wechatInfo.appids)
      .sort('-deliverInfo.priority -deliverInfo.count')
      .exec();

    console.log('[CALLBACK] getDeliverAds, result:');
    console.log(ads);
    return ads;
  },

  deliver: async function (param) {
    console.log(__filename + '\n[CALL] deliver, param:');
    console.log(param);

    let ad = await adModel.findById(param.adId).exec();
    if( !ad ) {
      throw new Error('Can not find ad');
    }

    if( ad.deliverInfo.count < 1 ) {
      throw new Error('No count');
    }

    await this.models.dbs.ader.payoutBalance({
      aderId: ad.aderId,
      payout: param.payout,
    });

    ad.deliverInfo.count -= 1;
    await ad.save();

    console.log('[CALLBACK] deliver, result:');
    console.log(ad);
    return ad;
  },

  cancelDeliver: async function (param) {
    console.log(__filename + '\n[CALL] cancelDeliver, param:');
    console.log(param);

    let ad = await adModel.findById(param.adId).exec();
    if( !ad ) {
      throw new Error('Can not find ad');
    }

    ad.deliverInfo.count += 1;
    await ad.save();

    await this.models.dbs.ader.payoutBalance({
      aderId: ad.aderId,
      payout: -param.payout,
    });

    console.log('[CALLBACK] cancelDeliver, result:');
    console.log(ad);
    return ad;
  },

  stopAll: async function (param) {
    console.log(__filename + '\n[CALL] stopAll, param:');
    console.log(param);

    let ads = await adModel.find({ aderId: param.aderId }).exec();

    for( let ad of ads ){
      ad.state = 'OPEN';
      await ad.save();
    }

    console.log('[CALLBACK] stopAll, result:');
    console.log(ad);
    return ad;
  },

  update: async function (param) {
    console.log(__filename + '\n[CALL] update, param:');
    console.log(param);

    let ad = await adModel.findById(param.adId).exec();
    if( !ad ) {
      throw new Error('Can not find ad');
    }

    if( param.wechatMpAuthInfo ){
      if( param.wechatMpAuthInfo.pre_auth_code ) ad.wechatMpAuthInfo.pre_auth_code = param.wechatMpAuthInfo.pre_auth_code;
      if( param.wechatMpAuthInfo.access_token ) ad.wechatMpAuthInfo.access_token = param.wechatMpAuthInfo.access_token;
      if( param.wechatMpAuthInfo.expires_in ) ad.wechatMpAuthInfo.expires_in = param.wechatMpAuthInfo.expires_in;
      if( param.wechatMpAuthInfo.refresh_token ) ad.wechatMpAuthInfo.refresh_token = param.wechatMpAuthInfo.refresh_token;
    }
    await ad.save();

    console.log('[CALLBACK] update, result:');
    console.log(ad);
    return ad;
  },

  createAuth: async function (param) {
    console.log(__filename + '\n[CALL] createAuth, param:');
    console.log(param);

    if( param.ader.balance <= 0 ){
      throw new Error('Ader is poor');
    }

    const ad = await adModel.create({ 
      createDate: new Date(),
      aderId: param.ader._id,
      type: 'WECHAT_MP_AUTH',
      deliverInfo: {
        payout: param.ader.payout,
      },
      wechatMpAuthInfo: { },
    });

    console.log('[CALLBACK] createAuth, result:');
    console.log(ad);
    return ad;
  },

  finishAuth: async function (param) {
    console.log(__filename + '\n[CALL] finishAuth, param:');
    console.log(param);

    if( !param.wechatMpAuthInfo.appid ){
      throw new Error('appid is empty');
    }
    const sameAppidAd = await this.getByAppid({ appid: param.wechatMpAuthInfo.appid });
    if( sameAppidAd ){
      throw new Error('appid is exist');
    }

    let ad = await adModel.findOne({
      'wechatMpAuthInfo.pre_auth_code': param.wechatMpAuthInfo.pre_auth_code,
      state: 'CREATE',
    }).exec();
    if( !ad ) {
      throw new Error('Can not find ad');
    }

    if( param.wechatMpAuthInfo ){
      if( param.wechatMpAuthInfo.appid ) ad.wechatMpAuthInfo.appid = param.wechatMpAuthInfo.appid;
      if( param.wechatMpAuthInfo.user_name ) ad.wechatMpAuthInfo.user_name = param.wechatMpAuthInfo.user_name;
      if( param.wechatMpAuthInfo.qrcode_url ) ad.wechatMpAuthInfo.qrcode_url = param.wechatMpAuthInfo.qrcode_url;
      if( param.wechatMpAuthInfo.access_token ) ad.wechatMpAuthInfo.access_token = param.wechatMpAuthInfo.access_token;
      if( param.wechatMpAuthInfo.expires_in ) ad.wechatMpAuthInfo.expires_in = param.wechatMpAuthInfo.expires_in;
      if( param.wechatMpAuthInfo.refresh_token ) ad.wechatMpAuthInfo.refresh_token = param.wechatMpAuthInfo.refresh_token;
      if( param.wechatMpAuthInfo.nick_name ) ad.wechatMpAuthInfo.nick_name = param.wechatMpAuthInfo.nick_name;
      if( param.wechatMpAuthInfo.head_img ) ad.wechatMpAuthInfo.head_img = param.wechatMpAuthInfo.head_img;
      if( param.wechatMpAuthInfo.service_type !== undefined ) ad.wechatMpAuthInfo.service_type = param.wechatMpAuthInfo.service_type;
      if( param.wechatMpAuthInfo.verify_type !== undefined ) ad.wechatMpAuthInfo.verify_type = param.wechatMpAuthInfo.verify_type;
    }
    ad.state = 'OPEN';
    await ad.save();

    console.log('[CALLBACK] finishAuth, result:');
    console.log(ad);
    return ad;
  },

  cancelAuth: async function (param) {
    console.log(__filename + '\n[CALL] cancelAuth, param:');
    console.log(param);

    let raw = await adModel.update({
      'wechatMpAuthInfo.appid': param.appid,
    }, {
      $set: { state: 'CANCEL' },
    }, {
      multi: true,
    }).exec();

    console.log('[CALLBACK] cancelAuth, result:');
    console.log(raw);
    return raw;
  },

};

