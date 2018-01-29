'use strict';

module.exports = {
    order:              require('./order'),
    wechat:             require('./wechat'),
    apis: {
        channel:        require('./apis/channel'),
        device:         require('./apis/device'),
        qrcode:         require('./apis/qrcode'),
        wechatMp:       require('./apis/wechatMp'),
        wechatOpen:     require('./apis/wechatOpen'),
        wechatPay:      require('./apis/wechatPay'),
    },
    dbs: {
        ad:             require('./dbs/ad'),
        ader:           require('./dbs/ader'),
        config:         require('./dbs/config'),
        log:            require('./dbs/log'),
        order:          require('./dbs/order'),
        partner:        require('./dbs/partner'),
        point:          require('./dbs/point'),
        staff:          require('./dbs/staff'),
        user:           require('./dbs/user'),
    },
    utils: {
        crypt:          require('./utils/crypt'),
        request:        require('./utils/request'),
        time:           require('./utils/time'),
    },
};
