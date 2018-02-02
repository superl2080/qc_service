

module.exports = {

    deliverAd: async function (param) {
        console.log(__filename + '\n[CALL] deliverAd, param:');
        console.log(param);

        try {
            const adChannelConfig = await this.models.dbs.config.getAdChannelById({ adChannelId: param.adChannelId });

            if(adChannelConfig.name == 'YOUFENTONG') {
                let url = adChannelConfig.url;
                url += '?bid=' + adChannelConfig.bid;
                url += '&openid=' + param.user._id.toString();
                url += '&nickname=' + encodeURIComponent(param.user.wechatInfo.nickname);
                url += '&bidcity=' + encodeURIComponent(param.city);

                const apiResult = await this.models.utils.request.getJson({ url : url });

                if( !apiResult
                    || apiResult.error !== 0
                    || !apiResult.list
                    || apiResult.list[0].auth === undefined
                    || !apiResult.list[0].appid
                    || !apiResult.list[0].qrcode_url ){
                    throw new Error('deliverAd is error');
                }

                const result = apiResult.list[0];
                result.auth = false;
                result.payout = Math.round(result.price * 100);
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

