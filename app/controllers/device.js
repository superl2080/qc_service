'use strict';

const models = require('../models')


module.exports = {

    update: async (req, res, next) => {
        console.log(__filename + '\n[CALL] update, body:');
        console.log(req.body);

        try {
            let deviceInfo;
            if( req.body.devNo ) deviceInfo.devNo = req.body.devNo;
            if( req.body.type ) deviceInfo.type = req.body.type;
            if( req.body.state ) deviceInfo.state = req.body.state;
            if( !deviceInfo.devNo
                || typeof deviceInfo.devNo != 'string' ){
                throw new Error('devNo is empty');
            } else if( deviceInfo.type
                && typeof deviceInfo.type != 'string'){
                throw new Error('type is error');
            } else if( deviceInfo.state
                && typeof deviceInfo.state != 'string'){
                throw new Error('state is error');
            }

            await models.dbs.point.updateDeviceForce(deviceInfo);

            res.send({
                code: 0,
                data: {
                    res: 'SUCCESS'
                },
                message: 'Update device info success.',
            });

        } catch(err) {
            console.error(__filename + '[CALL] update, req.body:' + JSON.stringify(req.body) + ', err:' + err.message);
            res.send({
                code: 20001,
                data: {
                    res: 'FAIL'
                },
                message: err.message,
            });
        }
    },

};

