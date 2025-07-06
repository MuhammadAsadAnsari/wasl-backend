const express = require('express')
const app = express()
const {port} = require('./config.json')
const cors = require('cors');
const bodyParser = require('body-parser');
const jwtAuthenticate = require('./helpers/jwt-authentication')
const errorHandler = require('./helpers/error-handler')
const path = require("path")
// app.use(bodyParser.urlencoded({ extended: false }));
const session = require('express-session');
var cookieParser = require('cookie-parser')
app.use(express.static(path.join(__dirname)));

app.use(session({ secret: 'cats', resave: false, saveUninitialized: true }));
app.use(cookieParser());

app.set("view engine", "ejs");


app.use(cors({ origin: '*' }));

app.use((req, res, next) => {
    if (path.extname(req.path) === '.js') {
      res.header('Content-Type', 'application/javascript');
    }
    next();
  });

// use JWT auth to secure the api

app.use('/auth', bodyParser.urlencoded({ extended: false }), bodyParser.json(), require('./auth/token.controller'));


app.use(jwtAuthenticate());
app.use(
  "/appuser",
  bodyParser.urlencoded({ extended: false }),
  bodyParser.json(),
  require("./user/user.controller")
);

app.use('/categories', bodyParser.urlencoded({ extended: false }), bodyParser.json(), require('./category/category.controller'));
app.use('/property', bodyParser.urlencoded({ extended: false }), bodyParser.json(), require('./property/property.controller'));
app.use('/userrequests', bodyParser.urlencoded({ extended: false }), bodyParser.json(), require('./requests/requests.controller'));
app.use('/services', bodyParser.urlencoded({ extended: false }), bodyParser.json(), require('./services/services.controller'));
app.use('/files', bodyParser.urlencoded({ extended: false }), bodyParser.json(), require('./files/files.controller'));
app.use('/adminchats', bodyParser.urlencoded({ extended: false }), bodyParser.json(), require('./chats/chat.controller.js'));
app.use('/visitors', bodyParser.urlencoded({ extended: false }), bodyParser.json(), require('./visitor/visitor.controller.js'));


app.use('/docs', require('./docs/docs.js'));

app.use(errorHandler);

app.listen(port);

module.exports = app;