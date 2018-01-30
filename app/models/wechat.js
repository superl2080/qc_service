

module.exports = {

    WECHAT_OPEN_APP_ID: process.env.WECHAT_OPEN_APP_ID,
    WECHAT_OPEN_APP_SECRET: process.env.WECHAT_OPEN_APP_SECRET,

    getOpenToken: async function (param) {
        console.log(__filename + '\n[CALL] getOpenToken, param:');
        console.log(param);

        let wechatOpenConfig = await this.models.dbs.config.getWechatOpen();
        if( !wechatOpenConfig
            || !wechatOpenConfig.access_token
            || !wechatOpenConfig.expires_in
            || !(await this.models.utils.time.checkExpiresInDate({ expiresInDate: wechatOpenConfig.expires_in })) ){
            const newOpenToken = await this.models.apis.wechatOpen.getOpenToken({
                openAppid: this.WECHAT_OPEN_APP_ID,
                openAppSecret: this.WECHAT_OPEN_APP_SECRET,
                ticket: wechatOpenConfig.ticket,
            });
            wechatOpenConfig = await this.models.dbs.config.updateWechatOpenForce({
                access_token: newOpenToken.component_access_token,
                expires_in: await this.models.utils.time.createExpiresInDate({ expires_in: newOpenToken.expires_in }),
            });
        }
        const result = wechatOpenConfig.access_token;

        console.log('[CALLBACK] getOpenToken, result:');
        console.log(result);
        return result;
    },

    getMpToken: async function (param) {
        console.log(__filename + '\n[CALL] getMpToken, param:');
        console.log(param);

        let wechatMpAuthInfo = param.ad.wechatMpAuthInfo;
        if( !wechatMpAuthInfo
            || !wechatMpAuthInfo.access_token
            || !wechatMpAuthInfo.expires_in
            || !(await this.models.utils.time.checkExpiresInDate({ expiresInDate: wechatMpAuthInfo.expires_in })) ){
            const openToken = await this.getOpenToken();
            const newMpToken = await this.models.apis.wechatOpen.refreshAuth({
                openAppid: this.WECHAT_OPEN_APP_ID,
                openToken: openToken,
                mpAppid: wechatMpAuthInfo.appid,
                mpRefreshToken: wechatMpAuthInfo.refresh_token,
            });
            const ad = await this.models.dbs.ad.update({
                adId: param.ad._id,
                wechatMpAuthInfo: {
                    access_token: newMpToken.authorizer_access_token,
                    expires_in: await this.models.utils.time.createExpiresInDate({ expires_in: newMpToken.expires_in }),
                    refresh_token: newMpToken.authorizer_refresh_token,
                },
            });
            wechatMpAuthInfo = ad.wechatMpAuthInfo;
        }
        const result = wechatMpAuthInfo.access_token;

        console.log('[CALLBACK] getMpToken, result:');
        console.log(result);
        return result;
    },

    updateMpAuthInfo: async function (param) {
        console.log(__filename + '\n[CALL] updateMpAuthInfo, param:');
        console.log(param);

        const openToken = await this.getOpenToken();
        const mpAuth = await this.models.apis.wechatOpen.queryAuth({
            openAppid: this.WECHAT_OPEN_APP_ID,
            openToken: openToken,
            code: param.auth_code,
        });

        let haveFuncscope = false;
        for(let func_info of mpAuth.func_info) {
            if( func_info.funcscope_category.id == 1 ){
                haveFuncscope = true;
                break;
            }
        }
        if( !haveFuncscope ) {
            await this.models.dbs.ad.cancelAuth({ appid: mpAuth.authorizer_appid });
            throw new Error('do not have funcscope');
        }

        const mpInfo = await this.models.apis.wechatOpen.getMpInfo({
            openAppid: this.WECHAT_OPEN_APP_ID,
            openToken: openToken,
            mpAppid: mpAuth.authorizer_appid,
        });
        const qrcode_url = 'http://open.weixin.qq.com/qr/code?username=' + mpInfo.user_name;

        const ad = await this.models.dbs.ad.finishAuth({
            wechatMpAuthInfo: {
                pre_auth_code: param.pre_auth_code,
                appid: mpAuth.authorizer_appid,
                user_name: mpInfo.user_name,
                qrcode_url: qrcode_url,
                access_token: mpAuth.authorizer_access_token,
                expires_in: await this.models.utils.time.createExpiresInDate({ expires_in: mpAuth.expires_in }),
                refresh_token: mpAuth.authorizer_refresh_token,
                nick_name: mpInfo.nick_name,
                head_img: mpInfo.head_img,
                service_type: mpInfo.service_type_info.id,
                verify_type: mpInfo.verify_type_info.id,
            },
        });

        console.log('[CALLBACK] updateMpAuthInfo, result:');
        console.log(ad);
        return ad;
    },

};

