
const async = require('async');
const pointModel = require('../../imports/models/point');
const partnerModel = require('../../imports/models/partner');
const orderHelper = require('../../imports/helpers/order');


const deviceUpdate = exports.deviceUpdate = (req, res, next) => {
    console.log('[CALL] deviceUpdate, body:');
    console.log(req.body);

    async.auto({
        GetDefaultPartner: (callback) => {
            console.log('[CALL] deviceUpdate, GetDefaultPartner');
            partnerModel.GetDefaultPartner(null, callback);
        },

        UpdatePoint: ['GetDefaultPartner', (result, callback) => {
            console.log('[CALL] deviceUpdate, UpdatePoint');
            pointModel.UpdateZhijinji({
                partnerId: result.GetDefaultPartner._id,
                devNo: req.body.devNo,
                type: req.body.type,
                state: req.body.state
            }, callback);
        }]

    }, (err, result) => {
        console.log('[CALLBACK] deviceUpdate');
        let json = {
            code: 0,
            data: {
                res: 'SUCCESS'
            },
            message: 'Update device info success.'
        };
        if( err ) {
            json.code = 20001;
            json.data.res = 'FAIL';
            json.message = err.message;
        }
        res.send(json);
    });
}

const channelSubscribe = exports.channelSubscribe = (req, res, next) => {
    console.log('[CALL] channelSubscribe, body:');
    console.log(req.body);

    orderHelper.AdSubscribe({
        userId: req.body.userId,
        appid: req.body.appid
    }, (err, result) => {
        console.log('[CALLBACK] channelSubscribe');
        let json = {
            code: 0,
            data: {
                res: 'SUCCESS'
            },
            message: 'Channel subscribe success.'
        };
        if( err ) {
            json.code = 20002;
            json.data.res = 'FAIL';
            json.message = err.message;
        }
        res.send(json);
    });
}