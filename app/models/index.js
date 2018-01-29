'use strict';

import order from './order';
import wechat from './wechat';
import apis_channel from './apis/channel';
import apis_device from './apis/device';
import apis_qrcode from './apis/qrcode';
import apis_wechatMp from './apis/wechatMp';
import apis_wechatOpen from './apis/wechatOpen';
import apis_wechatPay from './apis/wechatPay';
import dbs_ad from './dbs/ad';
import dbs_ader from './dbs/ader';
import dbs_config from './dbs/config';
import dbs_order from './dbs/order';
import dbs_partner from './dbs/partner';
import dbs_point from './dbs/point';
import dbs_staff from './dbs/staff';
import dbs_user from './dbs/user';
import utils_crypt from './utils/crypt';
import utils_request from './utils/request';
import utils_time from './utils/time';


const index = {
    order: order,
    wechat: wechat,
    apis: {
        channel: apis_channel,
        device: apis_device,
        qrcode: apis_qrcode,
        wechatMp: apis_wechatMp,
        wechatOpen: apis_wechatOpen,
        wechatPay: apis_wechatPay,
    },
    dbs: {
        ad: dbs_ad,
        ader: dbs_ader,
        config: dbs_config,
        order: dbs_order,
        partner: dbs_partner,
        point: dbs_point,
        staff: dbs_staff,
        user: dbs_user,
    },
    utils: {
        crypt: utils_crypt,
        request: utils_request,
        time: utils_time,
    },
};

export default index;

