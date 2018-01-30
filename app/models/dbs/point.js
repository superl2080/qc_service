
const mongoose = require('mongoose');

const ObjectId = mongoose.Schema.Types.ObjectId;

const pointSchema = new mongoose.Schema({

    createDate:             { $type: Date,               required: true },

    partnerId:              { $type: ObjectId,           required: true },
    type:                   { $type: String,             required: true }, //'POINT', 'DEVICE'
    state:                  { $type: String,             default: 'OPEN' }, //'OPEN', 'DEPLOY', 'TEST', 'CLOSE'

    deviceInfo: {
        devNo:              String,
        type:               String, //'JUANZHI', 'ZHIJIN'
        state:              String,
    },

    deployInfo: {
        price:              Number,
        item:               String,
        name:               String,
        shop:               String,
        city:               String,
        operatorWechatId:   String,
    },

    info: {
        descript:           String,
    },
}, { typeKey: '$type' });

const pointModel = mongoose.model('point', pointSchema);;


module.exports = {

    getById: async function (param) {
        console.log(__filename + '\n[CALL] getById, param:');
        console.log(param);

        const point = await pointModel.findById(param.pointId).exec();

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
        if( !point ) {
            const partner = await this.models.dbs.partner.getDefaultPartner();
            point = await pointModel.create({
                createDate: new Date(),
                partnerId: partner._id,
                type: 'DEVICE',
                deviceInfo: deviceInfo,
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

