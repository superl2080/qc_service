'use strict';


const test1 = async (req, res, next) => {
    console.log(__filename + '\n[CALL] test1');

    res.send('test1');
}


module.exports = app => {

    app.get('/test/1', test1);

};
