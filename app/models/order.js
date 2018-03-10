

module.exports = {

  SIT_URL: process.env.SIT_URL,

  create: async function (param) {
    console.log(__filename + '\n[CALL] create, param:');
    console.log(param);

    await this.models.order.cancel({ user: param.user });
    let order = await this.models.dbs.order.create({
      user: param.user,
      point: param.point,
    });

    order = this.deliverAd({
      user: param.user,
      point: param.point,
      order: order,
    });

    console.log('[CALLBACK] create, result:');
    console.log(order);
    return order;
  },

  deliverAd: async function (param) {
    console.log(__filename + '\n[CALL] deliverAd, param:');
    console.log(param);

    let order = param.order;

    if( order.adInfo
      && order.adInfo.adId ){
      await this.models.dbs.ad.cancelDeliver({
        adId: order.adInfo.adId,
        payout: order.adInfo.payout,
      });
      order.adInfo.adId = undefined;
    }

    const otherConfig = await this.models.dbs.config.getOther();
    const userTodayCount = await this.models.dbs.order.getTodayCountByUser({ userId: param.user._id });
    if( userTodayCount >= otherConfig.adDeliverLimit ) return order;

    let ads = await this.models.dbs.ad.getDeliverAds({ user: param.user });

    for( let ad of ads ){
      try {
        let adInfo = {
          adId: ad._id,
          aderId: ad.aderId,
          payout: ad.deliverInfo.payout,
        };

        if( ad.deliverInfo.partnerType === 'WHITE'
          && ad.deliverInfo.partnerIds.indexOf(param.point.partnerId) < 0 ) {
          throw new Error('Do not in partner white list');

        } else if( ad.deliverInfo.partnerType === 'BLACK'
          && ad.deliverInfo.partnerIds.indexOf(param.point.partnerId) >= 0 ) {
          throw new Error('Do in partner black list');
        } 

        if( ad.deliverInfo.userType === 'WHITE' ){
          let inWhiteList = false;
          for( let tagList of ad.deliverInfo.userTags ){
            for( let tagUser of param.user.tags ){
              if(tagUser.indexOf(tagList) >= 0 ) {
                inWhiteList = true;
                break;
              }
            }
          }
          if(!inWhiteList) throw new Error('Do not in user tag white list');

        } else if( ad.deliverInfo.userType === 'BLACK' ){
          for( let tagList of ad.deliverInfo.userTags ){
            for( let tagUser of param.user.tags ){
              if(tagUser.indexOf(tagList) >= 0 ) {
                throw new Error('Do in user tag black list');
              }
            }
          }
        } 

        if( ad.type === 'WECHAT_MP_AUTH' ){
          adInfo.appid = ad.wechatMpAuthInfo.appid;
          adInfo.qrcode_url = ad.wechatMpAuthInfo.qrcode_url;

        } else if( ad.type === 'WECHAT_MP_API' ){
          const channelAd = await this.models.apis.channel.deliverAd({
            adChannelId: ad.wechatMpApiInfo.channelId,
            user: param.user,
            city: param.point.deployInfo.city,
          });
          adInfo.appid = channelAd.appid;
          adInfo.qrcode_url = channelAd.qrcode_url;
          if( channelAd.payout
            && channelAd.payout > adInfo.payout ) adInfo.payout = channelAd.payout;
        }

        await this.models.dbs.ad.deliver({
          adId: adInfo.adId,
          payout: adInfo.payout,
        });

        order = await this.models.dbs.order.update({
          orderId: order._id,
          adInfo: adInfo,
        });

        break;

      } catch(err){
        // try next
      }
    }

    console.log('[CALLBACK] deliverAd, result:');
    console.log(order);
    return order;
  },

  cancel: async function (param) {
    console.log(__filename + '\n[CALL] cancel, param:');
    console.log(param);

    const orders = await this.models.dbs.order.cancel(param);

    for( let order of orders ){
      if( order.adInfo
        && order.adInfo.adId ){
        await this.models.dbs.ad.cancelDeliver({
          adId: order.adInfo.adId,
          payout: order.adInfo.payout,
        });
      }
    }

    console.log('[CALLBACK] cancel, result:');
    console.log(orders);
    return orders;
  },

  adSubscribe: async function (param) {
    console.log(__filename + '\n[CALL] adSubscribe, param:');
    console.log(param);

    const user = await this.models.dbs.user.update({
      userId: param.user._id,
      wechatInfo: {
        appid: param.appid,
      },
    });
    let order = await this.models.dbs.order.getByUserAppid({
      userId: user._id,
      appid: param.appid,
    });
    if( order ) {
      const ad = await this.models.dbs.ad.getById({ adId: order.adInfo.adId });
      order = await this.models.dbs.order.update({
        orderId: order._id,
        state: 'SUCCESS',
        payInfo: {
          endDate: new Date(),
          payout: order.adInfo.payout,
          type: 'AD',
          openid: param.openid,
        },
      });
      order = await this.finishOrder({
        user: user,
        order: order,
      });
    }

    console.log('[CALLBACK] adSubscribe, result:');
    console.log(order);
    return order;
  },

  finishPay: async function (param) {
    console.log(__filename + '\n[CALL] finishPay, param:');
    console.log(param);

    let order = await this.models.dbs.order.getById({
      orderId: param.orderId,
    });
    if( order && order.state === 'OPEN' ) {
      order = await this.models.dbs.order.update({
        orderId: order._id,
        state: 'SUCCESS',
        payInfo: {
          endDate: new Date(),
          payout: (param.payout <= order.price) ? param.payout : order.price,
          type: 'PAY',
          channel: 'WECHAT',
          transaction_id: param.transaction_id,
        },
      });
      if( order.adInfo
        && order.adInfo.adId ){
        await this.models.dbs.ad.cancelDeliver({
          adId: order.adInfo.adId,
          payout: order.adInfo.payout,
        });
      }
      const user = await this.models.dbs.user.getById({ userId: order.userId });
      await this.finishOrder({
        user: user,
        order: order,
      });
    }

    console.log('[CALLBACK] finishPay, result:');
    console.log(order);
    return order;
  },

  finishOrder: async function (param) {
    console.log(__filename + '\n[CALL] finishOrder, param:');
    console.log(param);

    let order = param.order;
    const point = await this.models.dbs.point.getById({ pointId: order.pointId });
    await this.models.dbs.partner.incomeBalance({
      partnerId: point.partnerId,
      income: order.payInfo.payout,
    });
    if( point.type === 'POINT' ) {
      try {
        await this.sendMessage({
          user: param.user,
          point: point,
          order: order,
          openid: param.user.authId.wechatId,
          first: '订单凭证',
          remark: '感谢使用青橙服务！商家马上就为您派送哦~',
          url: this.SIT_URL + '/order?token=' + param.user._id.toString() + '&orderId=' + order._id.toString(),
        });
      } catch(err){
        console.error(err);
      }
      if( point.deployInfo.operatorWechatId ){
        try {
          await this.sendMessage({
            user: param.user,
            point: point,
            order: order,
            openid: point.deployInfo.operatorWechatId,
            first: '您有新的订单，请尽快派送',
            remark: '感谢使用青橙服务！客户正等待您派送哦~',
          });
        } catch(err){
          console.error(err);
        }
      }
    } else if( point.type === 'DEVICE' ) {
      try {
        await this.sendMessage({
          user: param.user,
          point: point,
          order: order,
          openid: param.user.authId.wechatId,
          first: '订单凭证',
          remark: '感谢使用青橙服务！机器正在努力取出您的物品哦~',
          url: this.SIT_URL + '/order?token=' + param.user._id.toString() + '&orderId=' + order._id.toString(),
        });
      } catch(err){
        console.error(err);
      }
      if( point.deployInfo.operatorWechatId ){
        try {
          await this.sendMessage({
            user: param.user,
            point: point,
            order: order,
            openid: point.deployInfo.operatorWechatId,
            first: '您有新的订单，已自动派送',
            remark: '感谢使用青橙服务！机器已经自动派送哦~',
          });
        } catch(err){
          console.error(err);
        }
      }
      try {
        const result = await this.models.apis.device.takeItem({
          orderId: order._id,
          devNo: point.deviceInfo.devNo,
        });
      } catch(err){
        order = await this.models.dbs.order.update({
          orderId: order._id,
          state: 'FAIL',
        });
      }
    }

    console.log('[CALLBACK] finishOrder, result:');
    console.log(order);
    return order;
  },

  sendMessage: async function (param) {
    console.log(__filename + '\n[CALL] sendMessage, param:');
    console.log(param);

    const ad = await this.models.dbs.ad.getDefault();
    const mpToken = await this.models.wechat.getMpToken({ ad: ad });
    const result = await this.models.apis.wechatMp.sendMessage({
      mpToken: mpToken,
      openid: param.openid,
      template_id: 'liuskL8rPL0B0BkfbocJwJKzZFWt9MHsw4aevL-TeFA',
      url: param.url,
      data: {
        first: {
          value: param.first,
        },
        tradeDateTime: {
          value: new Date().toLocaleString(),
        },
        orderType: {
          value: param.order.item,
        },
        customerInfo: {
          value: param.user.wechatInfo.nickname,
        },
        orderItemName: {
          value: '点位信息',
        },
        orderItemData: {
          value: param.point.deployInfo.shop + '-' + param.point.deployInfo.name,
        },
        remark: {
          value: param.remark,
        },
      }
    });

    console.log('[CALLBACK] sendMessage, result:');
    console.log(result);
    return result;
  },

};

