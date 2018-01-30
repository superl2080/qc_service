

module.exports = {

    run: async function () {
        setInterval(this.cleaningOrder.bind(this), 1 * 60 * 1000);
    },

    cleaningOrder: async function () {
        console.log(__filename + '\n[CALL] cleaningOrder');
        const expiresInDate = await this.models.utils.time.createExpiresInDate({ expires_in: -10 * 60 });
        await this.models.dbs.order.cancel({ expiresInDate: expiresInDate });
    },

};

