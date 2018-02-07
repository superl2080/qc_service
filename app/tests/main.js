

module.exports = {

  run: async function (app) {

    app.get('/test/1', this.test1.bind(this));
    app.get('/test/2', this.test2.bind(this));

  },

  test1: async function (req, res, next) {
    console.log(__filename + '\n[CALL] test1');

    const url = process.env.SERVICE_URL + '/test/2?name=' + encodeURIComponent('Super刘超😂');
    const result = await this.models.utils.request.getJson({url: url});
    return res.send(result);
  },

  test2: async function (req, res, next) {
    console.log(__filename + '\n[CALL] test2');
    console.log(req.query.name);

    return res.send({ name: req.query.name });
  },
  
};

