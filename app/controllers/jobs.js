'use strict';

const models = require('../models')


const cleaningOrder = async () => {
    console.log(__filename + '\n[CALL] cleaningOrder');
    const expiresInDate = await models.utils.time.createExpiresInDate({ expires_in: -10 * 60 * 1000 });
    await models.dbs.order.cancel({ expiresInDate: expiresInDate });
};

setInterval(cleaningOrder, 1 * 60 * 1000);

