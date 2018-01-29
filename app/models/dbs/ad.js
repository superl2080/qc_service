'use strict';

import mongoose from 'mongoose';
import models from '../../models';

const ObjectId = mongoose.Schema.Types.ObjectId;


const adSchema = new mongoose.Schema({

    createDate:             { $type: Date,               required: true },

    isDefault:              { $type: Boolean,            default: false },
    aderId:                 { $type: ObjectId,           required: true },
    type:                   { $type: String,             required: true }, //'WECHAT_MP_AUTH', 'WECHAT_MP_API'
    state:                  { $type: String,             default: 'CREATE' }, //'CREATE', 'OPEN', 'DELIVER', 'SUCESS', 'CANCEL', 'NO_BALANCE'

    deliverInfo: {
        payout:             { $type: Number,             required: true },
        priority:           { $type: Number,             default: 10 },
        count:              Number,
        partnerType:        { $type: String,             default: 'ALL' }, //'ALL', 'WHITE', 'BLACK'
        partnerIds:         [ ObjectId ],
        userType:           { $type: String,             default: 'ALL' }, //'ALL', 'WHITE', 'BLACK'
        userTags:           [ String ],
    },

    wechatMpAuthInfo: {
        pre_auth_code:      String,
        appid:              String,
        user_name:          String,
        qrcode_url:         String,
        access_token:       String,
        expires_in:         Date,
        refresh_token:      String,
        nick_name:          String,
        head_img:           String,
        service_type:       Number,
        verify_type:        Number,
    },

    wechatMpApiInfo: {
        adChannelId:        ObjectId,
    },
}, { typeKey: '$type' });

const adModel = mongoose.model('ad', adSchema);


module.exports = {

    getById: async param => {
        console.log(__filename + '\n[CALL] getById, param:');
        console.log(param);

        const ad = await adModel.findById(param.adId).exec();

        console.log('[CALLBACK] getById, result:');
        console.log(ad);
        return ad;
    },

    getByAppid: async param => {
        console.log(__filename + '\n[CALL] getByAppid, param:');
        console.log(param);

        const ad = await adModel.findOne({ 'wechatMpAuthInfo.appid' : param.appid }).exec();

        console.log('[CALLBACK] getById, result:');
        console.log(ad);
        return ad;
    },

    getDefault: async param => {
        console.log(__filename + '\n[CALL] getDefault, param:');
        console.log(param);

        const ad = await adModel.findOne({ isDefault: true }).exec();

        console.log('[CALLBACK] getDefault, result:');
        console.log(ad);
        return ad;
    },

    getDeliverAd: async param => {
        console.log(__filename + '\n[CALL] getDeliverAd, param:');
        console.log(param);

        const ads = await adModel.find({ state: 'DELIVER' })
            .gt('deliverInfo.count', 0)
            .nin('wechatMpAuthInfo.appid', param.user.wechatInfo.appids)
            .sort('-deliverInfo.priority createDate')
            .exec();

        let deliverAd;
        for( let ad of ads ){
            try {
                await models.dbs.ader.payoutBalance({
                    aderId: ad.aderId,
                    payout: ad.deliverInfo.payout,
                });
                ad.deliverInfo.count -= 1;
                deliverAd = await ad.save();
                break;
            } catch(err) {
                // find next
            }
        }

        console.log('[CALLBACK] getDeliverAd, result:');
        console.log(deliverAd);
        return deliverAd;
    },

    cancel: async param => {
        console.log(__filename + '\n[CALL] cancel, param:');
        console.log(param);

        let ad = await adModel.findById(param.adId).exec();
        if( !ad ) {
            throw new Error('Can not find ad');
        }

        ad.deliverInfo.count += 1;
        await ad.save();

        console.log('[CALLBACK] cancel, result:');
        console.log(ad);
        return ad;
    },

    update: async param => {
        console.log(__filename + '\n[CALL] update, param:');
        console.log(param);

        let wechatMpAuthInfo = {};
        if( param.pre_auth_code ) wechatMpAuthInfo.pre_auth_code = param.pre_auth_code;
        if( param.access_token ) wechatMpAuthInfo.access_token = param.access_token;
        if( param.expires_in ) wechatMpAuthInfo.expires_in = param.expires_in;
        if( param.refresh_token ) wechatMpAuthInfo.refresh_token = param.refresh_token;

        let ad = await adModel.findById(param.adId).exec();
        if( !ad ) {
            throw new Error('Can not find ad');
        }

        Object.assign(ad.wechatMpAuthInfo, wechatMpAuthInfo);
        await ad.save();

        console.log('[CALLBACK] update, result:');
        console.log(ad);
        return ad;
    },

    createAuth: async param => {
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
        });

        console.log('[CALLBACK] createAuth, result:');
        console.log(ad);
        return ad;
    },

    finishAuth: async param => {
        console.log(__filename + '\n[CALL] finishAuth, param:');
        console.log(param);

        let wechatMpAuthInfo = {};
        if( param.user_name ) wechatMpAuthInfo.user_name = param.user_name;
        if( param.qrcode_url ) wechatMpAuthInfo.qrcode_url = param.qrcode_url;
        if( param.access_token ) wechatMpAuthInfo.access_token = param.access_token;
        if( param.expires_in ) wechatMpAuthInfo.expires_in = param.expires_in;
        if( param.refresh_token ) wechatMpAuthInfo.refresh_token = param.refresh_token;
        if( param.nick_name ) wechatMpAuthInfo.nick_name = param.nick_name;
        if( param.head_img ) wechatMpAuthInfo.head_img = param.head_img;
        if( param.service_type ) wechatMpAuthInfo.service_type = param.service_type;
        if( param.verify_type ) wechatMpAuthInfo.verify_type = param.verify_type;
        if( !param.appid ){
            throw new Error('appid is empty');
        }
        const sameAppidAd = await models.dbs.ad.getByAppid({ appid: param.appid });
        if( sameAppidAd ){
            throw new Error('appid is exist');
        }
        wechatMpAuthInfo.appid = param.appid;

        let ad = await adModel.findOne({
            'wechatMpAuthInfo.pre_auth_code': param.pre_auth_code,
            state: 'CREATE',
        }).exec();
        if( !ad ) {
            throw new Error('Can not find ad');
        }

        ad.state = 'OPEN';
        Object.assign(ad.wechatMpAuthInfo, wechatMpAuthInfo);
        await ad.save();

        console.log('[CALLBACK] finishAuth, result:');
        console.log(ad);
        return ad;
    },

    cancelAuth: async param => {
        console.log(__filename + '\n[CALL] cancelAuth, param:');
        console.log(param);

        let raw = await adModel.update({
            'wechatMpAuthInfo.appid': param.appid,
            state: { $in: ['OPEN', 'DELIVER'] },
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

