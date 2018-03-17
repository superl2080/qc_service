
const fs = require('fs');
const mongoose = require('mongoose');
const path = require('path');


module.exports = {

  modules: { },

  controllers: {
    sit: { },
    pos: { },
  },

  models: {
    apis: { },
    dbs: { },
    utils: { },
  },

  run: async function (app) {
    console.log(__filename + '\n[CALL] run');

    mongoose.connect(process.env.MONGO_URL, { useMongoClient: true });

    await this.loadModules(path.join(__dirname, 'controllers'),     [this.controllers, this.modules]);
    await this.loadModules(path.join(__dirname, 'controllers/pos'), [this.controllers.pos, this.modules]);
    await this.loadModules(path.join(__dirname, 'controllers/sit'), [this.controllers.sit, this.modules]);
    await this.loadModules(path.join(__dirname, 'models'),          [this.models, this.modules]);
    await this.loadModules(path.join(__dirname, 'models/apis'),     [this.models.apis, this.modules]);
    await this.loadModules(path.join(__dirname, 'models/dbs'),      [this.models.dbs, this.modules]);
    await this.loadModules(path.join(__dirname, 'models/utils'),    [this.models.utils, this.modules]);
    
    await this.setModules(this.modules, 'models', this.models);

    this.controllers.jobs.run();

    app.post('/channel/subscribe',                        this.controllers.channel.subscribe.bind(this.controllers.channel));

    app.post('/device/update',                            this.controllers.device.update.bind(this.controllers.device));

    app.post('/wechat/mp/notice/:appid',                  this.controllers.wechatMp.notice.bind(this.controllers.wechatMp));
    app.post('/wechat/open/notice',                       this.controllers.wechatOpen.notice.bind(this.controllers.wechatOpen));
    app.post('/wechat/pay/notice',                        this.controllers.wechatPay.notice.bind(this.controllers.wechatPay));

    app.get('/sit/user/wechatScanPoint',                  this.controllers.sit.user.wechatScanPoint.bind(this.controllers.sit.user));
    app.get('/sit/user/wechatScanPointCbk',               this.controllers.sit.user.wechatScanPointCbk.bind(this.controllers.sit.user));
    app.get('/sit/user/wechatSubscribeMp',                this.controllers.sit.user.wechatSubscribeMp.bind(this.controllers.sit.user));
    app.get('/sit/user/wechatSubscribeMpCbk',             this.controllers.sit.user.wechatSubscribeMpCbk.bind(this.controllers.sit.user));
    app.get('/sit/order/pre',                             this.controllers.sit.order.pre.bind(this.controllers.sit.order));
    app.get('/sit/order',                                 this.controllers.sit.order.get.bind(this.controllers.sit.order));
    app.post('/sit/order/wechatPrepay',                   this.controllers.sit.order.wechatPrepay.bind(this.controllers.sit.order));

    app.get('/pos/ad/wechatAuth',                         this.controllers.pos.ad.wechatAuth.bind(this.controllers.pos.ad));
    app.get('/pos/ad/wechatAuthCbk',                      this.controllers.pos.ad.wechatAuthCbk.bind(this.controllers.pos.ad));
    app.post('/pos/partner/login',                        this.controllers.pos.partner.login.bind(this.controllers.pos.partner));
  },

  loadModules: async function (path, objs) {
    const files = fs.readdirSync(path);
    for( let file of files ){
      const pos = file.lastIndexOf('.');
      if( pos < 0 )
        continue;
      const filePrefix = file.substr(0, pos);
      const filePostfix = file.substr(pos + 1);
      if( filePrefix.length < 1 || filePostfix.length < 1 || filePostfix !== 'js' )
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

