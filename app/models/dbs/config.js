
const mongoose = require('mongoose');

const ObjectId = mongoose.Schema.Types.ObjectId;

const adChannelSchema = new mongoose.Schema({
    name:                   { $type: String,             required: true, unique: true },
    url:                    { $type: String,             required: true },
}, { typeKey: '$type' });

const otherSchema = new mongoose.Schema({
    deviceUrl:              String,
}, { typeKey: '$type' });

const partnerDeductSchema = new mongoose.Schema({
    character:              { $type: String,             required: true, unique: true },
    percent:                { $type: Number,             required: true },
}, { typeKey: '$type' });

const wechatOpenSchema = new mongoose.Schema({
    ticket:                 String,
    access_token:           String,
    expires_in:             Date,
}, { typeKey: '$type' });

const adChannelModel = mongoose.model('configAdChannel', adChannelSchema);
const otherModel = mongoose.model('configOther', otherSchema);
const partnerDeductModel = mongoose.model('configPartnerDeduct', partnerDeductSchema);
const wechatOpenModel = mongoose.model('configWechatOpen', wechatOpenSchema);


module.exports = {

    getAdChannel: async function (param) {
        console.log(__filename + '\n[CALL] getAdChannel, param:');
        console.log(param);

        const adChannel = await adChannelModel.findById(param.adChannelId).exec();

        console.log('[CALLBACK] getAdChannel, result:');
        console.log(adChannel);
        return adChannel;
    },

    getOther: async function (param) {
        console.log(__filename + '\n[CALL] getOther, param:');
        console.log(param);

        const other = await otherModel.findOne({ }).exec();

        console.log('[CALLBACK] getOther, result:');
        console.log(other);
        return other;
    },

    getPartnerDeduct: async function (param) {
        console.log(__filename + '\n[CALL] getPartnerDeduct, param:');
        console.log(param);

        const partnerDeduct = await partnerDeductModel.findById(param.partnerDeductId).exec();

        console.log('[CALLBACK] getPartnerDeduct, result:');
        console.log(partnerDeduct);
        return partnerDeduct;
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

