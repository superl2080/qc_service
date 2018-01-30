

module.exports = {

    WECHAT_OPEN_APP_ID: process.env.WECHAT_OPEN_APP_ID,
    WECHAT_OPEN_ENCODE_KEY: process.env.WECHAT_OPEN_ENCODE_KEY,

    notice: async (req, res, next) => {
        console.log(__filename + '\n[CALL] notice, body:');
        console.log(req.body);

        try {
            const decryptMsg = await this.models.utils.crypt.decryptWechatMsg({
                msg: req.body,
                aesKey: this.WECHAT_OPEN_ENCODE_KEY,
            });

            switch( decryptMsg.InfoType ){
            case 'component_verify_ticket':
                await this.models.dbs.config.updateWechatOpenForce({
                    ticket: decryptMsg.ComponentVerifyTicket,
                });
                break;
            case 'authorized':
            case 'updateauthorized':
                await this.models.wechat.updateMpAuthInfo({
                    auth_code: decryptMsg.AuthorizationCode,
                    pre_auth_code: decryptMsg.PreAuthCode
                });
                break;
            case 'unauthorized':
                await this.models.dbs.ad.cancelAuth({ appid: decryptMsg.AuthorizerAppid });
                break;
            default:
                ;
            }

            res.send('success');

        } catch(err) {
            console.error(__filename + '[CALL] notice, req.body:' + JSON.stringify(req.body) + ', err:' + err.message);
            res.send('success');
        }
    },

    adAuth: async (req, res, next) => {
        console.log(__filename + '\n[CALL] adAuth, query:');
        console.log(req.query);
        try {
            if( !req.query.adId ){
                throw new Error('adId is empty');
            }

            const openToken = await this.models.wechat.getOpenToken();
            const preAuthCode = await this.models.apis.wechatOpen.createPreAuthCode({
                openAppid: this.WECHAT_OPEN_APP_ID,
                openToken: openToken,
            });
            await this.models.dbs.ad.update({
                adId: req.query.adId,
                pre_auth_code: preAuthCode.pre_auth_code,
            });
            const url = await mpdels.apis.wechatOpen.getMpAuthUrl({
                openAppid: this.WECHAT_OPEN_APP_ID,
                pre_auth_code: preAuthCode.pre_auth_code,
                redirect_uri: 'http://' + req.headers.host + '/wechat/open/adAuthCbk?pre_auth_code=' + preAuthCode.pre_auth_code,
            });
            res.render('page-button', {
                title: '授权公众号吸粉',
                message: '点击确认，并使用公众号运营者微信进行扫码授权。青橙承诺，授权仅用于吸粉投放和粉丝关注判断。',
                button: url,
            });

        } catch(err) {
            console.error(__filename + '[CALL] adAuth, req.query:' + JSON.stringify(req.query) + ', err:' + err.message);
            next(err);
        }
    },

    adAuthCbk: async (req, res, next) => {
        console.log(__filename + '\n[CALL] adAuthCbk, query:');
        console.log(req.query);
        try {
            if( !req.query.auth_code
                || !req.query.pre_auth_code ){
                throw new Error('auth_code or pre_auth_code is empty');
            }

            await this.models.wechat.updateMpAuthInfo({
                auth_code: req.query.auth_code,
                pre_auth_code: req.query.pre_auth_code,
            });
            res.render('page', {
                title: '授权公众号吸粉',
                message: '授权成功！感谢使用青橙服务。',
            });
            
        } catch(err) {
            console.error(__filename + '[CALL] adAuthCbk, req.query:' + JSON.stringify(req.query) + ', err:' + err.message);
            next(err);
        }
    },

};

