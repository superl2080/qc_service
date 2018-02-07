
const mongoose = require('mongoose');

const ObjectId = mongoose.Schema.Types.ObjectId;

const partnerSchema = new mongoose.Schema({

  logid:                    String,
  password:                 String,
  name:                     { $type: String,              required: true },
  createDate:               { $type: Date,                required: true },
  authId: {
    wechatId:               String,
  },

  balance:                  { $type: Number,              required: true, default: 0 },
  characterId:              { $type: ObjectId,            required: true },

  info: {
    lastDate:               Date,
    loginTimes:             { $type: Number,              default: 0 },
    children:               [ ObjectId ],
    shop:                   String,
    city:                   String,
    phone:                  String,
    descript:               String,
  },
}, { typeKey: '$type' });

const partnerModel = mongoose.model('partner', partnerSchema);


module.exports = {

  getById: async function (param) {
    console.log(__filename + '\n[CALL] getById, param:');
    console.log(param);

    const partner = await partnerModel.findById(param.partnerId).exec();

    console.log('[CALLBACK] getById, result:');
    console.log(partner);
    return partner;
  },

  getDevicer: async function (param) {
    console.log(__filename + '\n[CALL] getDevicer, param:');
    console.log(param);

    const partnerCharacter = await this.models.dbs.config.getPartnerCharacterByName({ name: 'DEVICER' });
    const partner = await partnerModel.findOne({ characterId: partnerCharacter._id }).exec();

    console.log('[CALLBACK] getDevicer, result:');
    console.log(partner);
    return partner;
  },

  checkPassword: async function (param) {
    console.log(__filename + '\n[CALL] checkPassword, param:');
    console.log(param);

    const partner = await partnerModel.findOne({ logid: param.logid }).exec();
    let result = false;
    if( partner ) {
      result = await this.models.utils.crypt.passwordCompare({
        passwordAuth: param.password,
        passwordCrypt: partner.password,
      });
    }

    console.log('[CALLBACK] checkPassword, result:');
    console.log(result);
    return result;
  },

  incomeBalance: async function (param) {
    console.log(__filename + '\n[CALL] incomeBalance, param:');
    console.log(param);

    let partner = await partnerModel.findById(param.partnerId).exec();
    if( !partner ) {
      throw new Error('Can not find partner');
    }

    const partnerCharacter = await this.models.dbs.config.getPartnerCharacterById({ partnerCharacterId: partner.characterId });
    const balance = Math.round(param.income * (partnerCharacter.deduct / 100));
    await this.models.dbs.config.incomeOtherQcBalance({ income: balance });
    partner.balance += param.income - balance;
    await partner.save();

    console.log('[CALLBACK] incomeBalance, result:');
    console.log(partner);
    return partner;
  },

};

