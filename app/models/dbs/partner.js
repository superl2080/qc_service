
const mongoose = require('mongoose');

const ObjectId = mongoose.Schema.Types.ObjectId;

const partnerSchema = new mongoose.Schema({

    name:                   { $type: String,             required: true },
    createDate:             { $type: Date,               required: true },
    authId: {
        wechatId:           String,
    },

    isDefault:              { $type: Boolean,            default: false },
    balance:                { $type: Number,             required: true, default: 0 },
    partnerDeductId:        { $type: ObjectId,           required: true },

    info: {
        lastDate:           Date,
        loginTimes:         { $type: Number,             default: 0 },
        referee:            ObjectId,
        shop:               String,
        city:               String,
        phone:              String,
        descript:           String,
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

    getDefault: async function (param) {
        console.log(__filename + '\n[CALL] getDefault, param:');
        console.log(param);

        const partner = await partnerModel.findOne({ isDefault: true }).exec();

        console.log('[CALLBACK] getDefault, result:');
        console.log(partner);
        return partner;
    },

    incomeBalance: async function (param) {
        console.log(__filename + '\n[CALL] incomeBalance, param:');
        console.log(param);

        let partner = await partnerModel.findById(param.partnerId).exec();
        if( !partner ) {
            throw new Error('Can not find partner');
        }

        const partnerDeduct = await this.models.dbs.config.getPartnerDeduct({ partnerDeductId: partner.partnerDeductId });
        partner.balance += Math.round(param.income * (1 - partnerDeduct.percent));
        await partner.save();

        console.log('[CALLBACK] incomeBalance, result:');
        console.log(partner);
        return partner;
    },

};

