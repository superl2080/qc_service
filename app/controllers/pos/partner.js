

module.exports = {

  login: async function (req, res, next) {
    console.log(__filename + '\n[CALL] login, body:');
    console.log(req.body);
    try {
      if( !req.body.logid
        || !req.body.password ){
        throw new Error('logid/password is empty');
      }

      const partner = await this.models.dbs.partner.getByPasswordLogin(req.body);
      const partnerCharacter = await this.models.dbs.config.getPartnerCharacterById({ partnerCharacterId: partner.characterId });

      return res.send({
        code: 0,
        data: {
          token: partner._id.toString(),
          character: partnerCharacter.name,
        },
      });

    } catch(err) {
      console.error(__filename + '[CALL] login, req.body:' + JSON.stringify(req.body) + ', err:' + err.message);
      return res.send({
        code: 22000,
        data: {
          token: undefined,
          character: 'GUEST',
        },
        message: err.message,
      });
    }
  },

};

