
const fs = require('fs');
const mongoose = require('mongoose');
const path = require('path');


module.exports = {

    modules: { },

    controllers: { },

    models: {
        apis: { },
        dbs: { },
        utils: { },
    },

    tests: { },

    run: async function (app) {
        console.log(__filename + '\n[CALL] run');

        mongoose.connect(process.env.MONGO_URL, { useMongoClient: true });

        await this.loadModules(path.join(__dirname, 'controllers'), [this.controllers, this.modules]);
        await this.loadModules(path.join(__dirname, 'models'), [this.models, this.modules]);
        await this.loadModules(path.join(__dirname, 'models/apis'), [this.models.apis, this.modules]);
        await this.loadModules(path.join(__dirname, 'models/dbs'), [this.models.dbs, this.modules]);
        await this.loadModules(path.join(__dirname, 'models/utils'), [this.models.utils, this.modules]);
        await this.loadModules(path.join(__dirname, 'tests'), [this.tests, this.modules]);
        await this.setModules(this.modules, 'models', this.models);

        if( process.env.NODE_ENV == 'test' ) {
            this.tests.main.run(app);
        }

        this.controllers.jobs.run();

        app.post('/channel/subscribe',              this.controllers.channel.subscribe.bind(this.controllers.channel));

        app.post('/device/update',                  this.controllers.device.update.bind(this.controllers.device));

        app.get('/user/login/wechat',               this.controllers.user.loginWechat.bind(this.controllers.user));
        app.get('/user/login/wechatCbk',            this.controllers.user.loginWechatCbk.bind(this.controllers.user));
        app.get('/user/scan/wechat',                this.controllers.user.scanWechat.bind(this.controllers.user));
        app.get('/user/scan/wechatCbk',             this.controllers.user.scanWechatCbk.bind(this.controllers.user));

        app.get('/order',                           this.controllers.order.get.bind(this.controllers.order));
        app.post('/order/prepay/wechat',            this.controllers.order.prepayWechat.bind(this.controllers.order));

        app.post('/wechat/mp/notice/:appid',        this.controllers.wechatMp.notice.bind(this.controllers.wechatMp));

        app.post('/wechat/open/notice',             this.controllers.wechatOpen.notice.bind(this.controllers.wechatOpen));
        app.get('/wechat/open/adAuth',              this.controllers.wechatOpen.adAuth.bind(this.controllers.wechatOpen));
        app.get('/wechat/open/adAuthCbk',           this.controllers.wechatOpen.adAuthCbk.bind(this.controllers.wechatOpen));

        app.post('/wechat/pay/notice',              this.controllers.wechatPay.notice.bind(this.controllers.wechatPay));
    },

    loadModules: async function (path, objs) {
        const files = fs.readdirSync(path);
        for( let file of files ){
            const pos = file.lastIndexOf('.');
            if( pos < 0 )
                continue;
            const filePrefix = file.substr(0, pos);
            const filePostfix = file.substr(pos + 1);
            if( filePrefix.length < 1 || filePostfix.length < 1 || filePostfix != 'js' )
                continue;
            const module = require(path + '/' + filePrefix);
            for( let obj of objs ){
                if( obj[filePrefix] === undefined ){
                    obj[filePrefix] = module;
                } else {
                    for( let i = 1; i >= 0; i++ ){
                        if( obj[filePrefix + i] === undefined ){
                            obj[filePrefix + i] = module;
                            break;
                        }
                    }
                }
            }
        }
    },

    setModules: async function (obj, name, module) {
        for( let key of Object.keys(obj) ){
            obj[key][name] = module;
        }
    },

};
