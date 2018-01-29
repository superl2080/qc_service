'use strict';

import models from '../../models';


module.exports = {

    createExpiresInDate: async param => {
        console.log(__filename + '\n[CALL] createExpiresIn, param:');
        console.log(param);

        const expiresInDate = new Date();
        expiresInDate.setTime(expiresInDate.getTime() + param.expires_in * 1000 - 1 * 60 * 1000);

        console.log('[CALLBACK] createExpiresIn, result:');
        console.log(expiresInDate);
        return expiresInDate;
    },

    checkExpiresInDate: async param => {
        console.log(__filename + '\n[CALL] passwordCompare, param:');
        console.log(param);

        const currentDate = new Date();
        const result = currentDate.getTime() < param.expiresInDate.getTime();

        console.log('[CALLBACK] passwordCompare, result:');
        console.log(result);
        return result;
    },

};

