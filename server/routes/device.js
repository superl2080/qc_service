
const async = require('async');
const pointModel = require('../../imports/models/point');
const partnerModel = require('../../imports/models/partner');


const update = exports.update = (req, res, next) => {

    async.auto({
        Pre: (callback) => {
            console.log('[CALL] update, Pre');
            callback(null, {
                req: req,
                res: res,
                next: next
            });
        },

        GetDefaultPartner: ['Pre', (result, callback) => {
            console.log('[CALL] update, GetDefaultPartner');
            partnerModel.GetDefaultPartner(null, callback);
        }],

        UpdatePoint: ['GetDefaultPartner', (result, callback) => {
            console.log('[CALL] update, UpdatePoint');
            pointModel.UpdateZhijinji({
                partnerId: result.GetDefaultPartner._id,
                devNo: result.Pre.req.body.devNo,
                type: result.Pre.req.body.type,
                state: result.Pre.req.body.state
            }, callback);
        }]

    }, (err, result) => {
        console.log('[CALLBACK] update');
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
        result.Pre.res.send(json);
    });
};

