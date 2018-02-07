

module.exports = {

  createExpiresInDate: async function (param) {

    const expiresInDate = new Date();
    expiresInDate.setTime(expiresInDate.getTime() + param.expires_in * 1000 - 1 * 60 * 1000);

    return expiresInDate;
  },

  checkExpiresInDate: async function (param) {

    const currentDate = new Date();
    const result = currentDate.getTime() < param.expiresInDate.getTime();

    return result;
  },

};

