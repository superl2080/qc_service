
const mongoose = require('mongoose');

const ObjectId = mongoose.Schema.Types.ObjectId;

const aderSchema = new mongoose.Schema({

  name:                     { $type: String,              required: true },
  createDate:               { $type: Date,                required: true },

  balance:                  { $type: Number,              required: true },
  payout:                   { $type: Number,              required: true },

  info: {
    phone:                  String,
    descript:               String,
  },
}, { typeKey: '$type' });

const aderModel = mongoose.model('ader', aderSchema);


module.exports = {

  getById: async function (param) {
    console.log(__filename + '\n[CALL] getById, param:');
    console.log(param);

    const ader = await aderModel.findById(param.aderId).exec();

    console.log('[CALLBACK] getById, result:');
    console.log(ader);
    return ader;
  },

  payoutBalance: async function (param) {
    console.log(__filename + '\n[CALL] payoutBalance, param:');
    console.log(param);

    let ader = await aderModel.findById(param.aderId).exec();
    if( !ader ) {
      throw new Error('Can not find ader');
    }

    if( ader.balance < param.payout ) {
      throw new Error('No balance');
    }

    ader.balance -= param.payout;
    await ader.save();
    
    console.log('[CALLBACK] payoutBalance, result:');
    console.log(ader);
    return ader;
  },

};

