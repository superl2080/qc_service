

module.exports = {

  run: async function () {
    setInterval(this.cleaningOrder.bind(this), 2 * 60 * 1000);
  },

  cleaningOrder: async function () {
    console.log(__filename + '\n[CALL] cleaningOrder');
    const expiresInDate = await this.models.utils.time.createExpiresInDate({ expires_in: -15 * 60 });
    await this.models.dbs.order.cancel({ expiresInDate: expiresInDate });
  },

};

