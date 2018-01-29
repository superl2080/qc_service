'use strict';

const models = require('../../models');


module.exports = {

    getMpAuthUrl: async param => {
        console.log(__filename + '\n[CALL] getMpAuthUrl, param:');
        console.log(param);

        let url = 'https://mp.weixin.qq.com/cgi-bin/componentloginpage?component_appid=' + param.openAppid;
        url += '&pre_auth_code=' + param.pre_auth_code;
        url += '&redirect_uri=' + encodeURIComponent(param.redirect_uri);
        url += '&auth_type=1';

        console.log('[CALLBACK] getMpAuthUrl, result:');
        console.log(url);
        return url;
    },

    getOpenToken: async param => {
        console.log(__filename + '\n[CALL] getOpenToken, param:');
        console.log(param);

        try {
            const apiResult = await models.utils.request.postJson({
                url: 'https://api.weixin.qq.com/cgi-bin/component/api_component_token',
                json: {
                    component_appid: param.openAppid,
                    component_appsecret: param.openAppSecret, 
                    component_verify_ticket: param.ticket,
                },
            });

            if( !apiResult
                || !apiResult.component_access_token
                || !apiResult.expires_in ) {
                throw new Error('getOpenToken is error');
            }

            const result = apiResult;
            console.log('[CALLBACK] getOpenToken, result:');
            console.log(result);
            return result;

        } catch(err) {
            console.error(__filename + '[CALL] getOpenToken, param:' + JSON.stringify(param) + ', err:' + err.message);
            throw err;
        }

    },

    createPreAuthCode: async param => {
        console.log(__filename + '\n[CALL] createPreAuthCode, param:');
        console.log(param);

        try {
            const apiResult = await models.utils.request.postJson({
                url: 'https://api.weixin.qq.com/cgi-bin/component/api_create_preauthcode?component_access_token=' + param.openToken,
                json: {
                    component_appid: param.openAppid,
                },
            });

            if( !apiResult
                || !apiResult.pre_auth_code ) {
                throw new Error('createPreAuthCode is error');
            }

            const result = apiResult;
            console.log('[CALLBACK] createPreAuthCode, result:');
            console.log(result);
            return result;

        } catch(err) {
            console.error(__filename + '[CALL] createPreAuthCode, param:' + JSON.stringify(param) + ', err:' + err.message);
            throw err;
        }

    },

    queryAuth: async param => {
        console.log(__filename + '\n[CALL] queryAuth, param:');
        console.log(param);

        try {
            const apiResult = await models.utils.request.postJson({
                url: 'https://api.weixin.qq.com/cgi-bin/component/api_query_auth?component_access_token=' + param.openToken,
                json: {
                    component_appid: param.openAppid,
                    authorization_code: param.code,
                },
            });

            if( !apiResult
                || !apiResult.authorization_info ) {
                throw new Error('queryAuth is error');
            }

            const result = apiResult.authorization_info;
            console.log('[CALLBACK] queryAuth, result:');
            console.log(result);
            return result;

        } catch(err) {
            console.error(__filename + '[CALL] queryAuth, param:' + JSON.stringify(param) + ', err:' + err.message);
            throw err;
        }

    },

    refreshAuth: async param => {
        console.log(__filename + '\n[CALL] refreshAuth, param:');
        console.log(param);

        try {
            const apiResult = await models.utils.request.postJson({
                url: 'https://api.weixin.qq.com/cgi-bin/component/api_authorizer_token?component_access_token=' + param.openToken,
                json: {
                    component_appid: param.openAppid,
                    authorizer_appid: param.mpAppid,
                    authorizer_refresh_token: param.mpRefreshToken,
                },
            });

            if( !apiResult ) {
                throw new Error('refreshAuth is error');
            }

            const result = apiResult;
            console.log('[CALLBACK] refreshAuth, result:');
            console.log(result);
            return result;

        } catch(err) {
            console.error(__filename + '[CALL] refreshAuth, param:' + JSON.stringify(param) + ', err:' + err.message);
            throw err;
        }

    },

    getMpInfo: async param => {
        console.log(__filename + '\n[CALL] getMpInfo, param:');
        console.log(param);

        try {
            const apiResult = await models.utils.request.postJson({
                url: 'https://api.weixin.qq.com/cgi-bin/component/api_get_authorizer_info?component_access_token=' + param.openToken,
                json: {
                    component_appid: param.openAppid,
                    authorizer_appid: param.mpAppid,
                },
            });

            if( !apiResult ) {
                throw new Error('getMpInfo is error');
            }

            const result = apiResult.authorizer_info;
            console.log('[CALLBACK] getMpInfo, result:');
            console.log(result);
            return result;
            
        } catch(err) {
            console.error(__filename + '[CALL] getMpInfo, param:' + JSON.stringify(param) + ', err:' + err.message);
            throw err;
        }

    },

};

