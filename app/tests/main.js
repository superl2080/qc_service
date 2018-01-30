

module.exports = {

    run: async function (app) {

        app.get('/test/1', this.test1.bind(this));

    },

    test1: async function (req, res, next) {
        console.log(__filename + '\n[CALL] test1');

        console.log(this.models);
        res.send('test1');
    }
};

