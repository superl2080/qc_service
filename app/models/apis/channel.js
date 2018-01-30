

module.exports = {

    deliverAd: async function (param) {
        console.log(__filename + '\n[CALL] deliverAd, param:');
        console.log(param);

        try {
            const adChannelConfig = await this.models.dbs.config.getAdChannel({ adChannelId: param.adChannelId });

            if(adChannelConfig.name == 'YOUFENTONG') {
                let url = adChannelConfig.url;
                url += '?bid=' + adChannelConfig.bid;
                url += '&openid=' + param.user._id.toString();
                url += '&nickname=' + param.user.wechatInfo.nickname;
                url += '&bidcity=' + param.city;

                const apiResult = await this.models.utils.request.getJson({ url : url });

                if( !apiResult
                    || apiResult.error !== 0
                    || !apiResult.list
                    || apiResult.list.auth === undefined
                    || !apiResult.list.appid
                    || !apiResult.list.qrcode_url ){
                    throw new Error('deliverAd is error');
                }

                const result = apiResult.list;
                console.log('[CALLBACK] deliverAd, result:');
                console.log(result);
                return result;
                
            } else {
                throw new Error('Not right channel');
            }

        } catch(err) {
            console.error(__filename + '[CALL] deliverAd, param:' + JSON.stringify(param) + ', err:' + err.message);
            throw err;
        }

    },

};

