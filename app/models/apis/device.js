

module.exports = {

    takeItem: async function (param) {
        console.log(__filename + '\n[CALL] takeItem, param:');
        console.log(param);

        try {
            const otherConfig = await this.models.dbs.config.getOther();

            const apiResult = await this.models.utils.request.postJson({
                url: otherConfig.deviceUrl + '/api/TakeDeviceItem',
                json: {
                    devNo: param.devNo,
                    deviceOrderId: param.orderId.toString()
                }
            });

            if( !apiResult.data
                || apiResult.data.res != 'SUCCESS' ){
                throw new Error('takeItem is error');
            }

            const result = apiResult.data.res;
            console.log('[CALLBACK] takeItem, result:');
            console.log(result);
            return result;

        } catch(err) {
            console.error(__filename + '[CALL] takeItem, param:' + JSON.stringify(param) + ', err:' + err.message);
            throw err;
        }
    },

};

