
const mongoose = require('mongoose');

const ObjectId = mongoose.Schema.Types.ObjectId;

const adChannelSchema = new mongoose.Schema({
  name:                     { $type: String,              required: true, unique: true }, // YOUFENTONG, YUNDAI
  url:                      { $type: String,              required: true },
  bid:                      String,
}, { typeKey: '$type' });

const itemSchema = new mongoose.Schema({
  name:                     { $type: String,              required: true },
  price:                    { $type: Number,              required: true },
  type:                     String, // OTHER, ZHIJIN
}, { typeKey: '$type' });

const otherSchema = new mongoose.Schema({
  deviceUrl:                String,
  qcBalance:                { $type: Number,              required: true, default: 0 },
  adDeliverLimit:           { $type: Number,              required: true },
}, { typeKey: '$type' });

const partnerCharacterSchema = new mongoose.Schema({
  name:                     { $type: String,              required: true, unique: true }, // DEVICER, OPERATOR, AGENT
  deduct:                   { $type: Number,              required: true },
}, { typeKey: '$type' });

const wechatOpenSchema = new mongoose.Schema({
  ticket:                   String,
  access_token:             String,
  expires_in:               Date,
}, { typeKey: '$type' });

const adChannelModel = mongoose.model('configAdChannel', adChannelSchema);
const itemModel = mongoose.model('configItem', itemSchema);
const otherModel = mongoose.model('configOther', otherSchema);
const partnerCharacterModel = mongoose.model('configPartnerCharacter', partnerCharacterSchema);
const wechatOpenModel = mongoose.model('configWechatOpen', wechatOpenSchema);


module.exports = {

  getAdChannelById: async function (param) {
    console.log(__filename + '\n[CALL] getAdChannelById, param:');
    console.log(param);

    const adChannel = await adChannelModel.findById(param.adChannelId).exec();

    console.log('[CALLBACK] getAdChannelById, result:');
    console.log(adChannel);
    return adChannel;
  },

  getItemById: async function (param) {
    console.log(__filename + '\n[CALL] getItemById, param:');
    console.log(param);

    const item = await itemModel.findById(param.itemId).exec();

    console.log('[CALLBACK] getItemById, result:');
    console.log(item);
    return item;
  },

  getItemByType: async function (param) {
    console.log(__filename + '\n[CALL] getItemByType, param:');
    console.log(param);

    const item = await itemModel.findOne({ type: param.type }).exec();

    console.log('[CALLBACK] getItemByType, result:');
    console.log(item);
    return item;
  },

  getOther: async function (param) {
    console.log(__filename + '\n[CALL] getOther, param:');
    console.log(param);

    const other = await otherModel.findOne({ }).exec();

    console.log('[CALLBACK] getOther, result:');
    console.log(other);
    return other;
  },

  incomeOtherQcBalance: async function (param) {
    console.log(__filename + '\n[CALL] incomeOtherQcBalance, param:');
    console.log(param);

    let other = await otherModel.findOne({ }).exec();
    if( !other ) {
      throw new Error('Can not find other');
    }

    other.qcBalance += param.income;
    await other.save();

    console.log('[CALLBACK] incomeOtherQcBalance, result:');
    console.log(other);
    return other;
  },

  getPartnerCharacterById: async function (param) {
    console.log(__filename + '\n[CALL] getPartnerCharacterById, param:');
    console.log(param);

    const partnerCharacter = await partnerCharacterModel.findById(param.partnerCharacterId).exec();

    console.log('[CALLBACK] getPartnerCharacterById, result:');
    console.log(partnerCharacter);
    return partnerCharacter;
  },

  getPartnerCharacterByName: async function (param) {
    console.log(__filename + '\n[CALL] getPartnerCharacterByName, param:');
    console.log(param);

    const partnerCharacter = await partnerCharacterModel.findOne({ name: param.name }).exec();

    console.log('[CALLBACK] getPartnerCharacterByName, result:');
    console.log(partnerCharacter);
    return partnerCharacter;
  },

  getWechatOpen: async function (param) {
    console.log(__filename + '\n[CALL] getWechatOpen, param:');
    console.log(param);

    const wechatOpen = await wechatOpenModel.findOne({ }).exec();

    console.log('[CALLBACK] getWechatOpen, result:');
    console.log(wechatOpen);
    return wechatOpen;
  },

  updateWechatOpenForce: async function (param) {
    console.log(__filename + '\n[CALL] updateWechatOpenForce, param:');
    console.log(param);

    let option = {};
    if( param.ticket ) option.ticket = param.ticket;
    if( param.access_token ) option.access_token = param.access_token;
    if( param.expires_in ) option.expires_in = param.expires_in;

    let wechatOpen = await wechatOpenModel.findOne({ }).exec();
    if( !wechatOpen ) {
      wechatOpen = await wechatOpenModel.create(option);
    } else {
      Object.assign(wechatOpen, option);
      await wechatOpen.save();
    }

    console.log('[CALLBACK] updateWechatOpenForce, result:');
    console.log(wechatOpen);
    return wechatOpen;
  },

};

