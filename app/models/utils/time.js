

module.exports = {

    createExpiresInDate: async function (param) {
        console.log(__filename + '\n[CALL] createExpiresInDate, param:');
        console.log(param);

        const expiresInDate = new Date();
        expiresInDate.setTime(expiresInDate.getTime() + param.expires_in * 1000 - 1 * 60 * 1000);

        console.log('[CALLBACK] createExpiresInDate, result:');
        console.log(expiresInDate);
        return expiresInDate;
    },

    checkExpiresInDate: async function (param) {
        console.log(__filename + '\n[CALL] checkExpiresInDate, param:');
        console.log(param);

        const currentDate = new Date();
        const result = currentDate.getTime() < param.expiresInDate.getTime();

        console.log('[CALLBACK] checkExpiresInDate, result:');
        console.log(result);
        return result;
    },

};

