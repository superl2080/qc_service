

module.exports = {

    SIT_URL: process.env.SIT_URL,

    create: async function (param) {
        console.log(__filename + '\n[CALL] create, param:');
        console.log(param);

        await this.models.dbs.order.cancel({ user: param.user });
        let order = await this.models.dbs.order.create({
            user: param.user,
            point: param.point,
        });

        let ad;
        try {
            ad = await this.models.dbs.ad.getDeliverAd({ user: param.user });
        } catch(err){
            // no ad
        }

        if( ad ){
            let adInfo = {
                adId: ad._id,
                aderId: ad.aderId,
                payout: ad.deliverInfo.payout,
            };

            order = await this.models.dbs.order.update({
                orderId: order._id,
                adInfo: adInfo,
            });
            
            try {
                if( ad.type == 'WECHAT_MP_AUTH' ){
                    adInfo.appid = ad.wechatMpAuthInfo.appid;
                    adInfo.qrcode_url = ad.wechatMpAuthInfo.qrcode_url;

                } else if( ad.type == 'WECHAT_MP_API' ){
                    const channelAd = await this.models.apis.channel.deliverAd({
                        adChannelId: ad.wechatMpApiInfo.adChannelId,
                        user: param.user,
                        city: param.point.deployInfo.city,
                    });
                    adInfo.appid = channelAd.appid;
                    adInfo.qrcode_url = channelAd.qrcode_url;
                    if( channelAd.payout
                        && channelAd.payout > ad.deliverInfo.payout ) adInfo.payout = channelAd.payout;
                    if( channelAd.auth === true ) {
                        const qrcode = await this.models.apis.qrcode.getImage({ url: channelAd.qrcode_url });
                        adInfo.qrcode_url = qrcode.url;
                    }
                }

                order = await this.models.dbs.order.update({
                    orderId: order._id,
                    adInfo: adInfo,
                });
            } catch(err){
                // with not useful ad
            }
        } else if( param.point.state == 'TEST' ){
            try {
                const ad = await this.models.dbs.ad.getDefaultDeliverAd();
                let adInfo = {
                    adId: ad._id,
                    aderId: ad.aderId,
                    appid: ad.wechatMpAuthInfo.appid,
                    qrcode_url: ad.wechatMpAuthInfo.qrcode_url,
                    payout: 0,
                };
                order = await this.models.dbs.order.update({
                    orderId: order._id,
                    adInfo: adInfo,
                });
            } catch(err){
                // with not useful ad
            }
        }

        console.log('[CALLBACK] create, result:');
        console.log(order);
        return order;
    },

    adSubscribe: async function (param) {
        console.log(__filename + '\n[CALL] adSubscribe, param:');
        console.log(param);

        const order = await this.models.dbs.order.getByUserAppid({
            userId: param.user._id,
            appid: param.appid,
        });
        const ad = await this.models.dbs.ad.getById({ adId: order.adInfo.adId });
        if( order ) {
            await this.models.dbs.order.update({
                orderId: order._id,
                state: 'SUCCESS',
                payInfo: {
                    endDate: new Date(),
                    payout: ad.deliverInfo.payout,
                    type: 'AD',
                    openid: param.openid,
                },
            });
            await this.finishOrder({
                user: param.user,
                order: order,
                payout: ad.deliverInfo.payout,
            });
        }

        console.log('[CALLBACK] adSubscribe, result:');
        console.log(order);
        return order;
    },

    finishPay: async function (param) {
        console.log(__filename + '\n[CALL] finishPay, param:');
        console.log(param);

        const order = await this.models.dbs.order.getById({
            orderId: param.orderId,
        });
        if( order && order.state == 'OPEN' ) {
            await this.models.dbs.order.update({
                orderId: order._id,
                state: 'SUCCESS',
                payInfo: {
                    endDate: new Date(),
                    payout: param.payout,
                    type: 'PAY',
                    channel: 'WECHAT',
                    transaction_id: param.transaction_id,
                },
            });
            if( order.adInfo ){
                await this.models.dbs.ad.cancel({ adId: order.adInfo.adId });
                await this.models.dbs.ader.payoutBalance({
                    aderId: order.adInfo.aderId,
                    payout: -order.adInfo.payout,
                });
            }
            const user = await this.models.dbs.user.getById({ userId: order.userId });
            await this.finishOrder({
                user: user,
                order: order,
                payout: param.payout,
            });
        }

        console.log('[CALLBACK] finishPay, result:');
        console.log(order);
        return order;
    },

    finishOrder: async function (param) {
        console.log(__filename + '\n[CALL] finishOrder, param:');
        console.log(param);

        const point = await this.models.dbs.point.getById({ pointId: param.order.pointId });
        await this.models.dbs.partner.incomeBalance({
            partnerId: point.partnerId,
            income: param.payout,
        });
        if( point.type == 'POINT' ) {
            try {
                await this.sendMessage({
                    user: param.user,
                    point: point,
                    order: param.order,
                    openid: param.user.authId.wechatId,
                    first: '订单凭证',
                    remark: '感谢使用青橙服务！商家马上就为您派送哦~',
                    url: this.SIT_URL + '/order?token=' + param.user._id.toString() + '&orderId=' + param.order._id.toString(),
                });
            } catch(err){
                console.error(err);
            }
            if( point.deployInfo.operatorWechatId ){
                try {
                    await this.sendMessage({
                        user: param.user,
                        point: point,
                        order: param.order,
                        openid: point.deployInfo.operatorWechatId,
                        first: '您有新的订单，请尽快派送',
                        remark: '感谢使用青橙服务！客户正等待您派送哦~',
                    });
                } catch(err){
                    console.error(err);
                }
            }
        } else if( point.type == 'DEVICE' ) {
            try {
                await this.sendMessage({
                    user: param.user,
                    point: point,
                    order: param.order,
                    openid: param.user.authId.wechatId,
                    first: '订单凭证',
                    remark: '感谢使用青橙服务！机器正在努力取出您的物品哦~',
                    url: this.SIT_URL + '/order?token=' + param.user._id.toString() + '&orderId=' + param.order._id.toString(),
                });
            } catch(err){
                console.error(err);
            }
            if( point.deployInfo.operatorWechatId ){
                try {
                    await this.sendMessage({
                        user: param.user,
                        point: point,
                        order: param.order,
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
                    orderId: param.order._id,
                    devNo: point.deviceInfo.devNo,
                });
            } catch(err){
                await this.models.dbs.order.update({
                    orderId: param.order._id,
                    state: 'FAIL',
                });
            }
        }

        console.log('[CALLBACK] finishOrder, result:');
        console.log(param.order);
        return param.order;
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

