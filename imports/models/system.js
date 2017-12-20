
const mongoose = require('mongoose');


const systemSchema = new mongoose.Schema({

    component_verify_ticket: String,
    component_access_token: String,
    pre_auth_code: String
});

const systemModel = mongoose.model('system', systemSchema);


const updateVerifyTicket = exports.updateVerifyTicket = function(component_verify_ticket, callback) {
    systemModel.findOneAndUpdate({ }, {$set: {component_verify_ticket: component_verify_ticket}}, {new: true})
    .exec(callback);
}
