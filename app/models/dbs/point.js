
const mongoose = require('mongoose');

const ObjectId = mongoose.Schema.Types.ObjectId;

const pointSchema = new mongoose.Schema({

  createDate:               { $type: Date,                required: true },
  name:                     { $type: String,              required: true },

  partnerId:                { $type: ObjectId,            required: true },
  type:                     { $type: String,              required: true }, //'POINT', 'DEVICE'
  state:                    { $type: String,              default: 'OPEN' }, //'OPEN', 'DEPLOY', 'CLOSE'

  deviceInfo: {
    devNo:                  String,
    type:                   String, //'JUANZHI', 'ZHIJIN'
    state:                  String,
  },

  item: {
    itemId:                 ObjectId,
    price:                  Number,
  },

  info: {
    descript:               String,
    city:                   String,
    shop:                   String,
    mgrPhone:               String,
    mgrWechatId:            String,
  },
}, { typeKey: '$type' });

const pointModel = mongoose.model('point', pointSchema);;

pointSchema.virtual('item.name').get(function () {
    const item = await this.models.dbs.config.getItemById({ itemId: this.item.itemId });
    return item.name;
});



module.exports = {

  getById: async function (param) {
    console.log(__filename + '\n[CALL] getById, param:');
    console.log(param);

    let point = await pointModel.findById(param.pointId).exec();

    console.log('[CALLBACK] getById, result:');
    console.log(point);
    return point;
  },

  updateDeviceForce: async function (param) {
    console.log(__filename + '\n[CALL] updateDeviceForce, param:');
    console.log(param);

    let deviceInfo = {};
    if( param.devNo ) deviceInfo.devNo = param.devNo;
    if( param.type ) deviceInfo.type = param.type;
    if( param.state ) deviceInfo.state = param.state;

    let point = await pointModel.findOne({ 'deviceInfo.devNo': param.devNo }).exec();
    const item = await this.models.dbs.config.getItemByType({ type: 'ZHIJIN' });
    if( !point ) {
      const partner = await this.models.dbs.partner.getDevicer();
      point = await pointModel.create({
        createDate: new Date(),
        partnerId: partner._id,
        type: 'DEVICE',
        deviceInfo: deviceInfo,
        item: {
          itemId: item._id,
          price: item.price,
        },
      });
    } else {
      Object.assign(point.deviceInfo, deviceInfo);
      await point.save();
    }

    console.log('[CALLBACK] updateDeviceForce, result:');
    console.log(point);
    return point;
  },

};

