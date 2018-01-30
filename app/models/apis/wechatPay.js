

module.exports = {

    prepay: async param => {
        console.log(__filename + '\n[CALL] prepay, param:');
        console.log(param);

        try {
            let prepayJson = {
                body: param.body,
                notify_url: param.notify_url,
                openid: param.openid,
                spbill_create_ip: param.spbill_create_ip,
                out_trade_no: param.out_trade_no,
                total_fee: param.total_fee,
                appid: param.mpAppid,
                mch_id: param.payId,
                nonce_str: await this.models.utils.crypt.randomHex(16),
                trade_type: 'JSAPI',
            };
            prepayJson.sign = await this.paySign({
                data: prepayJson,
                payKey: param.payKey,
            });

            const apiResult = await this.models.utils.request.postXml({
                url: 'https://api.mch.weixin.qq.com/pay/unifiedorder',
                json: prepayJson,
            });

            if( apiResult.return_code != 'SUCCESS'
                || apiResult.result_code != 'SUCCESS'
                || !apiResult.prepay_id ) {
                throw new Error('prepay is error');
            }

            let result = {
                appId: param.mpAppid,
                nonceStr: await this.models.utils.crypt.randomHex(16),
                package: 'prepay_id=' + apiResult.prepay_id,
                signType: 'MD5',
                timeStamp: Math.round(new Date().getTime() / 1000).toString(),
            };
            result.paySign = await this.paySign({
                data: result,
                payKey: param.payKey,
            });
            console.log('[CALLBACK] prepay, result:');
            console.log(result);
            return result;

        } catch(err) {
            console.error(__filename + '[CALL] prepay, param:' + JSON.stringify(param) + ', err:' + err.message);
            throw err;
        }

    },

    paySign: async param => {
        console.log(__filename + '\n[CALL] paySign, param:');
        console.log(param);

        let stringSign = '';
        let keys = Object.keys(param.data);
        keys = keys.sort();
        for( let key of keys ){
            stringSign += '&' + key + '=' + param.data[key];
        }

        stringSign = stringSign.substr(1);
        stringSign += '&key=' + param.payKey;

        const result = await this.models.utils.crypt.encodeMd5({ data: stringSign });

        console.log('[CALLBACK] paySign, result:');
        console.log(result);
        return result;
    },
};

