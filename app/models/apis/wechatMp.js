'use strict';

const models = require('../../models');


module.exports = {

    getOAuthUrl: async param => {
        console.log(__filename + '\n[CALL] getOAuthUrl, param:');
        console.log(param);

        let state = 'state';
        if( param.state) state = param.state;

        let url = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + param.mpAppid;
        url += '&redirect_uri=' + encodeURIComponent(param.redirect_uri);
        url += '&response_type=code';
        url += '&scope=snsapi_userinfo';
        url += '&state=' + state;
        url += '&component_appid=' + param.openAppid;
        url += '#wechat_redirect';

        console.log('[CALLBACK] getOAuthUrl, result:');
        console.log(url);
        return url;
    },

    getOAuthToken: async param => {
        console.log(__filename + '\n[CALL] getOAuthToken, param:');
        console.log(param);

        try {
            let url = 'https://api.weixin.qq.com/sns/oauth2/component/access_token?appid=' + param.mpAppid;
            url += '&code=' + param.code;
            url += '&grant_type=authorization_code';
            url += '&component_appid=' + param.openAppid;
            url += '&component_access_token=' + param.openToken;

            const apiResult = await models.utils.request.getJson({ url: url });

            if( !apiResult
                || !apiResult.openid
                || !apiResult.access_token ){
                throw new Error('getOAuthToken is error');
            }

            const result = apiResult;
            console.log('[CALLBACK] getOAuthToken, result:');
            console.log(result);
            return result;

        } catch(err) {
            console.error(__filename + '[CALL] getOAuthToken, param:' + JSON.stringify(param) + ', err:' + err.message);
            throw err;
        }

    },

    getOAuthUserInfo: async param => {
        console.log(__filename + '\n[CALL] getOAuthUserInfo, param:');
        console.log(param);

        try {
            let url = ' https://api.weixin.qq.com/sns/userinfo?access_token=' + param.token;
            url += '&openid=' + param.openid;
            url += '&lang=zh_CN';

            const apiResult = await models.utils.request.getJson({ url: url });

            if( !apiResult
                || !apiResult.nickname ){
                throw new Error('getOAuthUserInfo is error');
            }

            if( apiResult.sex == 1 ){
                apiResult.sex = '男';
            } else if( apiResult.sex == 2 ){
                apiResult.sex = '女';
            } else {
                delete apiResult.sex;
            }
            const result = apiResult;
            console.log('[CALLBACK] getOAuthUserInfo, result:');
            console.log(result);
            return result;

        } catch(err) {
            console.error(__filename + '[CALL] getUserInfo, param:' + JSON.stringify(param) + ', err:' + err.message);
            throw err;
        }

    },

    getUserInfo: async param => {
        console.log(__filename + '\n[CALL] getUserInfo, param:');
        console.log(param);

        try {
            let url = 'https://api.weixin.qq.com/cgi-bin/user/info?access_token=' + param.mpToken;
            url += '&openid=' + param.openid;
            url += '&lang=zh_CN';

            const apiResult = await models.utils.request.getJson({ url: url });

            if( !apiResult
                || !apiResult.nickname ){
                throw new Error('getUserInfo is error');
            }

            if( apiResult.sex == 1 ){
                apiResult.sex = '男';
            } else if( apiResult.sex == 2 ){
                apiResult.sex = '女';
            } else {
                delete apiResult.sex;
            }
            const result = apiResult;
            console.log('[CALLBACK] getUserInfo, result:');
            console.log(result);
            return result;

        } catch(err) {
            console.error(__filename + '[CALL] getUserInfo, param:' + JSON.stringify(param) + ', err:' + err.message);
            throw err;
        }

    },

    sendMessage: async param => {
        console.log(__filename + '\n[CALL] sendMessage, param:');
        console.log(param);

        try {
            let json = {
                touser: param.openid,
                template_id: param.template_id,
                data: param.data,
            };
            if( param.url ) json.url = param.url;
            const apiResult = await models.utils.request.postJson({
                url: 'https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=' + param.mpToken,
                json: json,
            });

            if( !apiResult
                || apiResult.errcode !== 0
                || !apiResult.msgid ){
                throw new Error('sendMessage is error');
            }
            
            const result = apiResult.msgid;
            console.log('[CALLBACK] sendMessage, result:');
            console.log(result);
            return result;

        } catch(err) {
            console.error(__filename + '[CALL] sendMessage, param:' + JSON.stringify(param) + ', err:' + err.message);
            throw err;
        }

    },

    createQrcode: async param => {
        console.log(__filename + '\n[CALL] createQrcode, param:');
        console.log(param);

        try {
            let expire_seconds = 24 * 60 * 60;
            if( param.expire_seconds) expire_seconds = param.expire_seconds;

            const apiResult = await models.utils.request.postJson({
                url: 'https://api.weixin.qq.com/cgi-bin/qrcode/create?access_token=' + param.mpToken,
                json: {
                    expire_seconds: expire_seconds,
                    action_name: 'QR_STR_SCENE', 
                    action_info: { scene: { scene_str: param.scene_str }},
                },
            });

            if( !apiResult
                || !apiResult.url ){
                throw new Error('createQrcode is error');
            }
            
            const result = apiResult;
            console.log('[CALLBACK] createQrcode, result:');
            console.log(result);
            return result;

        } catch(err) {
            console.error(__filename + '[CALL] createQrcode, param:' + JSON.stringify(param) + ', err:' + err.message);
            throw err;
        }

    },

};

