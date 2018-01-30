

module.exports = {

    run: async () => {
        setInterval(cleaningOrder, 1 * 60 * 1000);
    },

    cleaningOrder: async () => {
        console.log(__filename + '\n[CALL] cleaningOrder');
        const expiresInDate = await this.models.utils.time.createExpiresInDate({ expires_in: -10 * 60 * 1000 });
        await this.models.dbs.order.cancel({ expiresInDate: expiresInDate });
    },

};

