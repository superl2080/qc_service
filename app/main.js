
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

        console.log(this.modules);

        if( process.env.NODE_ENV == 'test' ) {
            this.tests.main.run(app);
        }

        this.controllers.jobs.run();

        app.post('/channel/subscribe',              this.controllers.channel.subscribe);

        app.post('/device/update',                  this.controllers.device.update);

        app.get('/user/login/wechat',               this.controllers.user.loginWechat);
        app.get('/user/login/wechatCbk',            this.controllers.user.loginWechatCbk);
        app.get('/user/scan/wechat',                this.controllers.user.scanWechat);
        app.get('/user/scan/wechatCbk',             this.controllers.user.scanWechatCbk);

        app.get('/order',                           this.controllers.order.get);
        app.post('/order/prepay/wechat',            this.controllers.order.prepayWechat);

        app.post('/wechat/mp/notice/:appid',        this.controllers.wechatMp.notice);

        app.post('/wechat/open/notice',             this.controllers.wechatOpen.notice);
        app.get('/wechat/open/adAuth',              this.controllers.wechatOpen.adAuth);
        app.get('/wechat/open/adAuthCbk',           this.controllers.wechatOpen.adAuthCbk);

        app.post('/wechat/pay/notice',              this.controllers.wechatPay.notice);
    },

    loadModules: async (path, objs) => {
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

    setModules: async (obj, name, module) => {
        for( let key of Object.keys(obj) ){
            obj[key][name] = module;
        }
    },

};

