

module.exports = {

  run: async function () {
    setInterval(this.cleaningOrder.bind(this), 2 * 60 * 1000);
  },

  cleaningOrder: async function () {
    const expiresInDate = await this.models.utils.time.createExpiresInDate({ expires_in: -10 * 60 });
    await this.models.order.cancel({ expiresInDate: expiresInDate });
  },

};

