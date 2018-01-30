
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

        const user = await userModel.findOne({
            'wechatInfo.nickname': param.nickname,
            'wechatInfo.sex': param.sex,
            'wechatInfo.city': param.city,
            'wechatInfo.province': param.province,
            'wechatInfo.country': param.country,
        }).exec();

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
            });
        }

        console.log('[CALLBACK] getByWechatForce, result:');
        console.log(user);
        return user;
    },

    update: async function (param) {
        console.log(__filename + '\n[CALL] update, param:');
        console.log(param);

        let option = {};
        let wechatInfo = {};
        let appid;
        if( param.wechatInfo ){
            if( param.wechatInfo.nickname !== undefined ) wechatInfo.nickname = param.wechatInfo.nickname;
            if( param.wechatInfo.sex !== undefined ) wechatInfo.sex = param.wechatInfo.sex;
            if( param.wechatInfo.city !== undefined ) wechatInfo.city = param.wechatInfo.city;
            if( param.wechatInfo.province !== undefined ) wechatInfo.province = param.wechatInfo.province;
            if( param.wechatInfo.country !== undefined ) wechatInfo.country = param.wechatInfo.country;
        }
        if( param.appid ) appid = param.appid;

        let user = await userModel.findById(param.userId).exec();
        if( !user ) {
            throw new Error('Can not find user');
        }

        Object.assign(user, option);
        Object.assign(user.wechatInfo, wechatInfo);

        if( appid && user.wechatInfo.appids.indexOf(appid) < 0 ) user.wechatInfo.appids.push(appid);
        if ( user.tags.indexOf(user.wechatInfo.sex) < 0 ) user.tags.push(user.wechatInfo.sex);
        if ( user.tags.indexOf(user.wechatInfo.city) < 0 ) user.tags.push(user.wechatInfo.city);
        if ( user.tags.indexOf(user.wechatInfo.province) < 0 ) user.tags.push(user.wechatInfo.province);

        await user.save();

        console.log('[CALLBACK] update, result:');
        console.log(user);
        return user;
    },

};

