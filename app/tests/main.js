

module.exports = {

    run: async app => {

        app.get('/test/models', async (req, res, next) => {
            console.log(__filename + '\n[CALL] test1');

            res.send(this.models);
        });

    },

};

