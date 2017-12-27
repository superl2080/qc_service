
const async = require('async');
const wechatHelper = require('../../imports/helpers/wechat');
const cryptHelper = require('../../imports/helpers/crypt');


const authNotice = exports.authNotice = (req, res) => {

    async.auto({
        pre: (callback) => {
            console.log('[CALL] authNotice, pre');
            callback(null, {
                req: req,
                res: res
            });
        },

        parseXml: ['pre', (result, callback) => {
            console.log('[CALL] authNotice, parseXml');
            cryptHelper.ParseJsonFromXml(result.pre.req.body, callback);
        }],

        decrypt: ['parseXml', (result, callback) => {
            console.log('[CALL] authNotice, decrypt');
            const decryptData = wechatHelper.Decrypt(result.parseXml.xml.Encrypt[0]);
            cryptHelper.ParseJsonFromXml(decryptData, callback);
        }],

        checkTicket: ['decrypt', (result, callback) => {
            console.log('[CALL] authNotice, checkTicket');
            if( result.decrypt.xml.InfoType[0] == 'component_verify_ticket' ) {
                wechatHelper.UpdateTicket(result.decrypt.xml.ComponentVerifyTicket[0], callback);
            }
        }]

    }, (err, results) => {
        if( err ) {
            console.log('[ERROR] authNotice, err:');
            console.log(err);
        }
        console.log('[CALLBACK] authNotice');
        res.send('success');
    });
};

/*
const adNotice = exports.adNotice = (req, res) => {

    wechat.parseXml(req.rawBody, function (err, result) {

        var decryptData = wechat.decrypt(result.xml.Encrypt[0]);
        wechat.parseXml(decryptData, function (err, result2) {

            if( result2.xml.MsgType == 'event'
                && (result2.xml.Event[0] == 'subscribe' || result2.xml.Event[0] == 'SCAN')
                && result2.xml.EventKey[0] ) {
                var option = {
                    appid: req.params.appid
                };
                if( result2.xml.Event == 'subscribe' ) {
                    option.userId = result2.xml.EventKey[0].slice(8);
                } else {
                    option.userId = result2.xml.EventKey[0];
                }
                console.log('received option: ');
                console.log(option);
                user.finishAd(option, function (err, userInfo) {
                    if( !err && userInfo ){
                        ad.finishAd(option, function (err, adInfo) {
                            if( !err && adInfo ) {
                                option.adId = adInfo._id;
                                option.aderId = adInfo.aderId;
                                ader.finishAd(option, function (err, aderInfo) {
                                    if( !err && aderInfo ) {
                                        option.income = aderInfo.income;
                                        adOrder.insert(option, function (err, aderInfo) {});
                                        deviceOrder.finishAd(option, function (err, deviceOrderInfo) {
                                            option.deviceOrderInfo = deviceOrderInfo;
                                            TakeDeviceItem(option, function (err) {});
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            }

        });
    });
    res.send('');
};

const adAuth = exports.adAuth = (req, res) => {
view.on('get', { action: 'create' }, function (next) {
 -      console.log('[GET] routes/views/createAd action: create');
 -      system.findOne(function (err, systemInfo) {
 -          var uri = 'https://mp.weixin.qq.com/cgi-bin/componentloginpage?component_appid=' + wechat.APP_ID;
 -          uri += '&pre_auth_code=' + systemInfo.pre_auth_code;
 -          uri += '&redirect_uri=http%3A%2F%2F' + req.headers.host + '%2FcreateAd%3faction%3dsuccess%26aderId%3d' + req.query.aderId + '%26count%3d' + req.query.count;
 -          res.redirect(uri);
 -      });
 -  });

 -  view.on('get', { action: 'success' }, function (next) {
 -      console.log('[GET] routes/views/createAd actions: success');
 -      if( req.query.auth_code ) {
 -          wechat.getQueryAuth(req.query.auth_code, function (err, result) {
 -              wechat.updatingPreAuthCode();
 -              if( !err ) {
 -                  ad.find({appid: result.authorizer_appid, state: 'OPEN'}, function (err2, adInfos) {
 -                      if(adInfos.length <= 0) {
 -                          var option = {
 -                              aderId: req.query.aderId,
 -                              count: req.query.count,
 -                              state: "OPEN",
 -                              isDefault: false,
 -                              appid: result.authorizer_appid,
 -                              access_token: result.authorizer_access_token,
 -                              refresh_token: result.authorizer_refresh_token
 -                          };
 -                          ad.insert(option, function(err3) {
 -                              locals.action = 'success';
 -                              next(err3);
 -                          });
 -                      } else {
 -                          locals.action = 'fail';
 -                          next();
 -                      }
 -                  });
 -              } else {
 -                  locals.action = 'fail';
 -                  next(err);
 -              }
 -          });
 -      } else {
 -          locals.action = 'fail';
 -          next();
 -      }
 -  });
 -  

};




function TakeDeviceItem(params, callback) {
    console.log('[CALL] routes/views/wechatAd/TakeDeviceItem');

    if(params.deviceOrderInfo &&
        params.deviceOrderInfo.state == 'SUCCESS') {
        var option = {
            url: 'http://106.14.195.50:80/api/TakeDeviceItem',
            method: 'POST',
            headers: {  
                'content-type': 'application/json'
            },
            json: {
                devNo: params.deviceOrderInfo.devNo,
                deviceOrderId: params.deviceOrderInfo._id.toString()
            }
        };
        console.log(option);
        request.post(option, function(err, res, body) {
            console.log('[CALLBACK] requestTakeItem, err:' + err + 'body:');
            console.log(body);
            var takeRes = 'FAIL';
            if(!body ||
                !body.data) {
            } else {
                takeRes = body.data.res;
            }
            if(takeRes == 'SUCCESS') {
                deviceOrder.finishTake(params, function (err, deviceOrderInfo) {
                    callback(err);
                });
            } else {
                callback(null);
            }
        });
    }
}


function updatingToken() {
    console.log('[CALL] routes/models/wechat/updatingToken');

    system.findOne(function (err, systemInfo) {
        var option = {
            url: 'https://api.weixin.qq.com/cgi-bin/component/api_component_token',
            method: 'POST',
            headers: {  
                'content-type': 'application/json'
            },
            json: {
                component_appid: WECHAT_OPEN_APP_ID,
                component_appsecret: WECHAT_OPEN_APP_SECRET, 
                component_verify_ticket: systemInfo.component_verify_ticket
            }
        };

        request.post(option, function(err2, ret, body) {
            console.log('[CALL] routes/models/wechat/updatingToken post return:');
            console.log(body);
            if(!ret.statusCode ||
                ret.statusCode != 200) {
                
            } else {
                system.updateAccessToken(body.component_access_token, function (err3, systemInfo2) {
                    
                });
            }
        });
    });
}

var updatingPreAuthCode = exports.updatingPreAuthCode = function () {
    console.log('[CALL] routes/models/wechat/updatingPreAuthCode');

    system.findOne(function (err, systemInfo) {
        
        var option = {
            url: 'https://api.weixin.qq.com/cgi-bin/component/api_create_preauthcode?component_access_token='
                + systemInfo.component_access_token,
            method: 'POST',
            headers: {  
                'content-type': 'application/json'
            },
            json: {
                component_appid: WECHAT_OPEN_APP_ID
            }
        };

        request.post(option, function(err2, ret, body) {
            console.log('[CALL] routes/models/wechat/updatingPreAuthCode post return:');
            console.log(body);
            if(!ret.statusCode ||
                ret.statusCode != 200) {
                
            } else {
                system.updatePreAuthCode(body.pre_auth_code, function (err3, systemInfo2) {
                    
                });
            }
        });
    });
}

exports.getQueryAuth = function(authorization_code, callback) {
    console.log('[CALL] routes/models/wechat/getQueryAuth');

    system.findOne(function (err, systemInfo) {
        var option = {
            url: 'https://api.weixin.qq.com/cgi-bin/component/api_query_auth?component_access_token='
                + systemInfo.component_access_token,
            method: 'POST',
            headers: {  
                'content-type': 'application/json'
            },
            json: {
                component_appid: WECHAT_OPEN_APP_ID,
                authorization_code: authorization_code
            }
        };

        request.post(option, function(err2, ret, body) {
            console.log('[CALL] routes/models/wechat/getQueryAuth post return:');
            console.log(body);
            if(!ret.statusCode ||
                ret.statusCode != 200) {
                
            } else {
                callback(null, body.authorization_info);
            }
        });
    });
}

function updatingAdToken() {
    console.log('[CALL] routes/models/wechat/updatingAdToken');

    system.findOne(function (err, systemInfo) {
        ad.find({state: 'OPEN'}, function (err2, adInfos) {
            adInfos.forEach(function(adInfo){
                var option = {
                    url: 'https://api.weixin.qq.com/cgi-bin/component/api_authorizer_token?component_access_token='
                        + systemInfo.component_access_token,
                    method: 'POST',
                    headers: {  
                        'content-type': 'application/json'
                    },
                    json: {
                        component_appid: WECHAT_OPEN_APP_ID,
                        authorizer_appid: adInfo.appid, 
                        authorizer_refresh_token: adInfo.refresh_token
                    }
                };
                (function (appid) {
                    request.post(option, function(err, ret, body) {
                        console.log('[CALL] routes/models/wechat/updatingAdToken post return:');
                        console.log(body);
                        if(!ret.statusCode ||
                            ret.statusCode != 200) {
                            
                        } else {
                            body.appid = appid;
                            ad.updateToken(body, function (err, adInfo2) {
                                
                            });
                        }
                    });
                }) (adInfo.appid);
            });
        });
    });
}


updatingToken();
setInterval(function () {
    updatingToken();
}, 90 * 60 * 1000);

updatingPreAuthCode();
setInterval(function () {
    updatingPreAuthCode();
}, 15  * 60 * 1000);

updatingAdToken();
setInterval(function () {
    updatingAdToken();
}, 90 * 60 * 1000);
*/
