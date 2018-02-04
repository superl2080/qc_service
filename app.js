const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const main = require('./app/main');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'app/views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.raw({ type: 'text/xml' }));
app.use(bodyParser.json({ type: 'application/json' }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'app/public')));

main.run(app);


// error handler
app.use(function(err, req, res, next) {

    // catch 404 and forward to error handler
    if ( !err ) {
        err = new Error('Not Found');
        err.status = 404;
    }

    err.status = err.status || 500;
    console.error(err);
    if (res.headersSent) {
        return next(err);
    }
    res.render('error', { error: err });
});

module.exports = app;
