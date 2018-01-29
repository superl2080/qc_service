'use strict';

import channel from './channel';
import device from './device';
import jobs from './jobs';
import order from './order';
import user from './user';
import wechatMp from './wechatMp';
import wechatOpen from './wechatOpen';
import wechatPay from './wechatPay';


const index = {
    channel: channel,
    device: device,
    jobs: jobs,
    order: order,
    user: user,
    wechatMp: wechatMp,
    wechatOpen: wechatOpen,
    wechatPay: wechatPay,
};

export default index;

