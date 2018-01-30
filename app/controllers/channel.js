

module.exports = {

    subscribe: async function (req, res, next) {
        console.log(__filename + '\n[CALL] subscribe, body:');
        console.log(req.body);

        try {
            if( !req.body.userId
                || !req.body.appid ){
                throw new Error('userId or appid is empty');
            }

            const ad = await this.models.dbs.ad.getByAppid({ appid: req.body.appid });
            if( !ad ){
                throw new Error('appid is error');
            }

            const user = await this.models.dbs.user.getById({ userId: req.body.userId });
            if( !user ){
                throw new Error('userId is error');
            }

            await this.models.order.adSubscribe({
                user: user,
                ad: ad,
            });

            res.send({
                code: 0,
                data: {
                    res: 'SUCCESS',
                },
                message: 'Channel subscribe success.',
            });
            
        } catch(err) {
            console.error(__filename + '[CALL] subscribe, req.body:' + JSON.stringify(req.body) + ', err:' + err.message);
            res.send({
                code: 20002,
                data: {
                    res: 'FAIL',
                },
                message: err.message,
            });
        }
    },

};

