require("dotenv").config();
var createError = require('http-errors');
var express = require('express');
var bodyParser = require('body-parser')
var session = require('express-session');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var mailRouter = require('./routes/mail');
var ticketRouter = require('./routes/ticket');
var issuedRouter = require('./routes/issued');
var verifyRouter = require('./routes/verify');
var vpRouter = require('./routes/vp');
var verifiedRouter = require('./routes/verified');

var vcRouter = require('./routes/vc');
var manifestRouter = require('./routes/manifest');
var issueRouter = require('./routes/issue');
var didRouter = require('./routes/did');
var completeRouter = require('./routes/complete');
var chkRouter = require('./routes/chk');
var confirmRouter = require('./routes/confirm');
var opRouter = require('./routes/op');


var db = require('./routes/db');

var app = express();
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.text());

app.use(session({
  secret: 'did/vc',
  resave: false,
  saveUninitialized: false
}))

app.use(db.db_init);
app.locals.request = {};
app.locals.captcha = [];

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/mail', mailRouter);
app.use('/ticket', ticketRouter);
app.use('/issued', issuedRouter);
app.use('/verify', verifyRouter);
app.use('/vp', vpRouter);
app.use('/verified', verifiedRouter);
app.use('/vc', vcRouter);
app.use('/manifest', manifestRouter);
app.use('/issue', issueRouter);
app.use('/complete', completeRouter);
app.use('/chk', chkRouter);
app.use('/confirm', confirmRouter);
app.use('/op', opRouter);
app.use('/.well-known', didRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
