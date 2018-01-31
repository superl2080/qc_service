
const mongoose = require('mongoose');

const ObjectId = mongoose.Schema.Types.ObjectId;

const userSchema = new mongoose.Schema({

    createDate:             { $type: Date,               required: true },
    authId: {
        wechatId:           String,
    },

    tags:                   [String],
    
    wechatInfo: {
        nickname:           String,
        sex:                String,
        city:               String,
        province:           String,
        country:            String,
        appids:             [String],
    },

}, { typeKey: '$type' });

const userModel = mongoose.model('user', userSchema);


module.exports = {

    getById: async function (param) {
        console.log(__filename + '\n[CALL] getById, param:');
        console.log(param);

        const user = await userModel.findById(param.userId).exec();

        console.log('[CALLBACK] getById, result:');
        console.log(user);
        return user;
    },

    getByWechatInfo: async function (param) {
        console.log(__filename + '\n[CALL] getByWechatInfo, param:');
        console.log(param);

        let option = {
            'wechatInfo.nickname': param.nickname,
        };
        if( param.sex ) option['wechatInfo.sex'] =  param.sex;
        if( param.city ) option['wechatInfo.city'] =  param.city;
        if( param.province ) option['wechatInfo.province'] =  param.province;
        if( param.country ) option['wechatInfo.country'] =  param.country;

        const user = await userModel.findOne(option).exec();

        console.log('[CALLBACK] getByWechatInfo, result:');
        console.log(user);
        return user;
    },

    getByWechatForce: async function (param) {
        console.log(__filename + '\n[CALL] getByWechatForce, param:');
        console.log(param);

        let user = await userModel.findOne({ 'authId.wechatId': param.wechatId }).exec();

        if( !user ) {
            user = await userModel.create({ 
                createDate: new Date(),
                authId: {
                    wechatId: param.wechatId,
                },
                tags: ['微信'],
                wechatInfo: {
                    appids: [],
                },
            });
        }

        console.log('[CALLBACK] getByWechatForce, result:');
        console.log(user);
        return user;
    },

    update: async function (param) {
        console.log(__filename + '\n[CALL] update, param:');
        console.log(param);

        let wechatInfo = {};
        let appid;

        let user = await userModel.findById(param.userId).exec();
        if( !user ) {
            throw new Error('Can not find user');
        }

        if( param.wechatInfo ){
            if( param.wechatInfo.nickname !== undefined ) user.wechatInfo.nickname = param.wechatInfo.nickname;
            if( param.wechatInfo.sex !== undefined ) user.wechatInfo.sex = param.wechatInfo.sex;
            if( param.wechatInfo.city !== undefined ) user.wechatInfo.city = param.wechatInfo.city;
            if( param.wechatInfo.province !== undefined ) user.wechatInfo.province = param.wechatInfo.province;
            if( param.wechatInfo.country !== undefined ) user.wechatInfo.country = param.wechatInfo.country;
            if( param.wechatInfo.appid
                && user.wechatInfo.appids.indexOf(param.wechatInfo.appid) < 0 ) user.wechatInfo.appids.push(param.wechatInfo.appid);
        }

        if ( user.tags.indexOf(user.wechatInfo.sex) < 0 ) user.tags.push(user.wechatInfo.sex);
        if ( user.tags.indexOf(user.wechatInfo.city) < 0 ) user.tags.push(user.wechatInfo.city);
        if ( user.tags.indexOf(user.wechatInfo.province) < 0 ) user.tags.push(user.wechatInfo.province);

        await user.save();

        console.log('[CALLBACK] update, result:');
        console.log(user);
        return user;
    },

};

