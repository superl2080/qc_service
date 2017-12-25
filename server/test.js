
const express = require('express');
require('../imports/models/operator');
require('../imports/models/operatorConfig');


const router = module.exports.router = express.Router();
const operatorModel = mongoose.model('operator');
const operatorConfigModel = mongoose.model('operatorConfig');


router.get('/db/operator/init', function(req, res, next) {

    operatorModel.findOne({ email: 'super' })
    .exec(function (err, operator) {
        if( !operator ) {
            operatorModel.create({
                email: 'super',
                name: 'Super'
                password: 'superliu',
                character: 'MANAGER',
            }, (err, callback) => {
                res.send('create a super');
            });
        } else {
            res.send('already have operator');
        }
    });
});

router.get('/db/operatorConfig/init', function(req, res, next) {

    operatorConfigModel.findOne({ })
    .exec(function (err, operatorConfig) {
        if( !operatorConfig ) {
            operatorConfigModel.create({
                wechatOpen: {
                    component_verify_ticket: ''
                }
            }, (err, callback) => {
                res.send('create SUCCESS');
            });
        } else {
            res.send('already have operatorConfig');
        }
    });
});

