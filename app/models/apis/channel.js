

module.exports = {

  deliverAd: async function (param) {
    console.log(__filename + '\n[CALL] deliverAd, param:');
    console.log(param);

    try {
      const adChannelConfig = await this.models.dbs.config.getAdChannelById({ adChannelId: param.adChannelId });
      let nickname = await this.models.utils.crypt.encodeUnicode({ str: param.user.wechatInfo.nickname });
      let sex = 0;
      if( param.user.wechatInfo.sex.indexOf('男') >= 0 ) sex = 1;
      if( param.user.wechatInfo.sex.indexOf('女') >= 0 ) sex = 2;

      if(adChannelConfig.name === 'YOUFENTONG') {

        let url = adChannelConfig.url;
        url += '?bid=' + adChannelConfig.bid;
        url += '&openid=' + param.user._id.toString();
        url += '&nickname=' + encodeURIComponent(nickname);
        url += '&sex=' + sex;
        url += '&bidcity=' + encodeURIComponent(param.city);

        const apiResult = await this.models.utils.request.getJson({ url : url });

        if( !apiResult
          || apiResult.error !== 0
          || !apiResult.list
          || !apiResult.list[0].appid
          || !apiResult.list[0].qrcode_url ){
          throw new Error('deliverAd is error');
        }

        const result = apiResult.list[0];
        result.payout = Math.round(result.price * 100);
        console.log('[CALLBACK] deliverAd, result:');
        console.log(result);
        return result;

      } else if(adChannelConfig.name === 'YUNDAI') {
        const apiResult = await this.models.utils.request.postJson({
          url: adChannelConfig.url,
          json: {
            userId: param.user._id.toString(),
            city: param.city,
            nickname: nickname,
            sex: sex,
            userCity: param.user.wechatInfo.city,
            appids: param.user.wechatInfo.appids,
          },
        });

        if( !apiResult
          || !apiResult.appid
          || !apiResult.qrcode_url ){
          throw new Error('deliverAd is error');
        }

        const result = apiResult;
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

