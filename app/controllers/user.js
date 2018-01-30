

module.exports = {

    WECHAT_MP_APP_ID: process.env.WECHAT_MP_APP_ID,
    WECHAT_OPEN_APP_ID: process.env.WECHAT_OPEN_APP_ID,

    loginWechat: async function (req, res, next) {
        console.log(__filename + '\n[CALL] loginWechat, query:');
        console.log(req.query);

        try {
            if( !req.query.redirect_uri ){
                throw new Error('redirect_uri is empty');
            }

            const redirect_uri = await this.models.utils.crypt.encryptString({ str: req.query.redirect_uri });
            const new_redirect_uri = 'http://' + req.headers.host + '/user/login/wechatCbk?redirect_uri=' + redirect_uri;
            const url = await this.models.apis.wechatMp.getOAuthUrl({
                openAppid: this.WECHAT_OPEN_APP_ID,
                mpAppid: this.WECHAT_MP_APP_ID,
                redirect_uri: new_redirect_uri,
            });

            res.redirect(url);

        } catch(err) {
            console.error(__filename + '[CALL] loginWechat, req.query:' + JSON.stringify(req.query) + ', err:' + err.message);
            res.redirect(req.query.redirect_uri);
        }
    },

    loginWechatCbk: async function (req, res, next) {
        console.log(__filename + '\n[CALL] loginWechatCbk');
        console.log(req.query);

        try {
            if( !req.query.code
                || !req.query.redirect_uri ){
                throw new Error('code is empty');
            }

            const openToken = await this.models.wechat.getOpenToken();
            const oAuthToken = await this.models.apis.wechatMp.getOAuthToken({
                openAppid: this.WECHAT_OPEN_APP_ID,
                openToken: openToken,
                mpAppid: this.WECHAT_MP_APP_ID,
                code: req.query.code,
            });
            const oAuthUserInfo = await this.models.apis.wechatMp.getOAuthUserInfo({
                token: oAuthToken.access_token,
                openid: oAuthToken.openid,
            });
            let user = await this.models.dbs.user.getByWechatForce({
                wechatId: oAuthToken.openid,
            });
            user = await this.models.dbs.user.update({
                userId: user._id,
                wechatInfo: oAuthUserInfo,
            });

            let redirect_uri = await this.models.utils.crypt.decryptString({ str: req.query.redirect_uri })
            if( redirect_uri.indexOf('?') >= 0 ) {
                redirect_uri += '&token=' + user._id.toString();
            } else {
                redirect_uri += '?token=' + user._id.toString();
            }
            res.redirect(redirect_uri);

        } catch(err) {
            console.error(__filename + '[CALL] loginWechat, req.query:' + JSON.stringify(req.query) + ', err:' + err.message);
            let redirect_uri = await this.models.utils.crypt.decryptString({ str: req.query.redirect_uri })
            res.redirect(redirect_uri);
        }
    },

    scanWechat: async function (req, res, next) {
        console.log(__filename + '\n[CALL] scanWechat, query:');
        console.log(req.query);

        try {
            if( !req.query.redirect_uri
                || !req.query.pointId ){
                throw new Error('redirect_uri or pointId is empty');
            }

            const redirect_uri = await this.models.utils.crypt.encryptString({ str: req.query.redirect_uri });
            const new_redirect_uri = 'http://' + req.headers.host + '/user/scan/wechatCbk?redirect_uri=' + redirect_uri;
            const url = await this.models.apis.wechatMp.getOAuthUrl({
                openAppid: this.WECHAT_OPEN_APP_ID,
                mpAppid: this.WECHAT_MP_APP_ID,
                redirect_uri: new_redirect_uri,
                state: req.query.pointId.toString(),
            });

            res.redirect(url);

        } catch(err) {
            console.error(__filename + '[CALL] scanWechat, req.query:' + JSON.stringify(req.query) + ', err:' + err.message);
            res.redirect(req.query.redirect_uri);
        }
    },

    scanWechatCbk: async function (req, res, next) {
        console.log(__filename + '\n[CALL] scanWechatCbk');
        console.log(req.query);

        try {
            if( !req.query.code
                || !req.query.redirect_uri
                || !req.query.state ){
                throw new Error('code is empty');
            }

            const openToken = await this.models.wechat.getOpenToken();
            const oAuthToken = await this.models.apis.wechatMp.getOAuthToken({
                openAppid: this.WECHAT_OPEN_APP_ID,
                openToken: openToken,
                mpAppid: this.WECHAT_MP_APP_ID,
                code: req.query.code,
            });
            const oAuthUserInfo = await this.models.apis.wechatMp.getOAuthUserInfo({
                token: oAuthToken.access_token,
                openid: oAuthToken.openid,
            });
            let user = await this.models.dbs.user.getByWechatForce({
                wechatId: oAuthToken.openid,
            });
            user = await this.models.dbs.user.update({
                userId: user._id,
                wechatInfo: oAuthUserInfo,
            });
            const point = await this.models.dbs.point.getById({ pointId: req.query.state });
            const order = await this.models.order.create({
                user: user,
                point: point,
            });

            let redirect_uri = await this.models.utils.crypt.decryptString({ str: req.query.redirect_uri })
            if( redirect_uri.indexOf('?') >= 0 ) {
                redirect_uri += '&token=' + user._id.toString();
            } else {
                redirect_uri += '?token=' + user._id.toString();
            }
            redirect_uri += '?orderId=' + order._id.toString();
            res.redirect(redirect_uri);

        } catch(err) {
            console.error(__filename + '[CALL] loginWechat, req.query:' + JSON.stringify(req.query) + ', err:' + err.message);
            let redirect_uri = await this.models.utils.crypt.decryptString({ str: req.query.redirect_uri })
            res.redirect(redirect_uri);
        }
    },

};

