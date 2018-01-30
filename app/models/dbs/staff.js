
const mongoose = require('mongoose');

const ObjectId = mongoose.Schema.Types.ObjectId;

const staffSchema = new mongoose.Schema({

    logid:                  { $type: String,             required: true, unique: true },
    password:               { $type: String,             required: true },
    name:                   { $type: String,             required: true },
    createDate:             { $type: Date,               required: true },

    character:              { $type: String,             required: true }, //'MANAGER', 'NORMAL'

    info: {
        lastDate:           Date,
        loginTimes:         { $type: Number,             default: 0 },
    },
}, { typeKey: '$type' });

const staffModel = mongoose.model('staff', staffSchema);


module.exports = {

    checkPassword: async function (param) {
        console.log(__filename + '\n[CALL] checkPassword, param:');
        console.log(param);

        const staff = await staffModel.findOne({ logid: param.logid }).exec();
        let result = false;
        if( staff ) {
            result = await this.models.utils.crypt.passwordCompare({
                passwordAuth: param.password,
                passwordCrypt: staff.password,
            });
        }

        console.log('[CALLBACK] checkPassword, result:');
        console.log(result);
        return result;
    },

    update: async function (param) {
        console.log(__filename + '\n[CALL] update, param:');
        console.log(param);

        let staff = await staffModel.findOne({ logid: param.logid }).exec();
        if( !staff ) {
            throw new Error('Can not find staff');
        }

        if( param.password ) staff.password = await this.models.utils.crypt.passwordCrypt({ password: param.password });
        await staff.save();

        console.log('[CALLBACK] update, result:');
        console.log(staff);
        return staff;
    },

};

