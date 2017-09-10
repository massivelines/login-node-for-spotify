var express = require('express');
var bodyParser = require("body-parser");
var http = require('http');
var request = require('request');
var rp = require('request-promise');
var expressWs = require('express-ws');

var app = express();
expressWs(app);



// TODO: convert to system vars
var client_id = '8d2ca6ffda244def9852f84650c2bfa2'; // Your client id
var client_secret = '5e1882b5faba4be4b3db73e9b72ac565';
var redirect_uri = 'http://localhost:5000/callback.html'; // Your redirect uri

var allowedConnections = ['http://localhost:5000', 'http://localhost:7879'];

var host;
var scopes = [];
var token;

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));


// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
  extended: false
}));

// parse application/json
app.use(bodyParser.json());



app.all('*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Cache-Control, Pragma, Origin, Authorization, Content-Type, X-Requested-With");
  res.header("Access-Control-Allow-Methods", "GET, PUT, POST, OPTIONS");
  next();
});

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};
var state;

// data pulled host calling requests and scopes
app.post('/data', function(req, res) {
  // console.log(req.body);
  host = req.body.hostURL;
  scopes = req.body.scopes;
  res.end();
});

// redirect for the intial login popup
app.get('/login', function(req, res) {
  token = null;
  state = generateRandomString(16);

  // TODO error out if never filled
  // loop that makes sure scopes is populated before calling for the redirect
  function loginRedirect() {
    if (scopes.length > 0) {
      var url = 'https://accounts.spotify.com/authorize?client_id=' + client_id +
        '&redirect_uri=' + encodeURIComponent(redirect_uri) +
        '&scope=' + encodeURIComponent(scopes.join(' ')) +
        '&response_type=code'+
        '&state=' +state+
        '&show_dialog=true';
      res.redirect(url);
    } else {
      setTimeout(function() {
        loginRedirect();
      }, 500);
    }
  }
  loginRedirect();

});

// callback from callback.html to pass spotify response codes to turn into token
app.post('/callback', function(req, res) {
  // console.log('callback called');
  var data = req.body;

  // test if state is sent back the same
  if (data.state == state) {
    var authOptions = {
      method: 'POST',
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: data.code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
    };

    // convert code into token for intial login
    rp(authOptions).
    then(function(body) {

      token = {
        access_token: body.access_token,
        refresh_token: body.refresh_token,
        expires_in: body.expires_in
      };
      // console.log(token);
      // send status code to close popup
      res.sendStatus(200);
    }).catch(function(err) {
      // TODO: when error redirect to login
      console.log(err);
    });
  }

});

// sends token to websocket js file
app.ws('/token', function (ws, req) {
  // TODO error out if never filled
  function sendToken() {
    if( typeof token !== 'undefined' || typeof token !== null){
      // console.log(token);
      ws.send(JSON.stringify(token));
    } else {
      setTimeout(sendToken, 500);
    }

  }

  sendToken();
});

// refreshes the token called by the websocket
app.ws('/refresh', function (ws, req) {
  ws.on('message', function (old_token) {

    old_token = JSON.parse(old_token);
    // console.log(old_token);

    var data = req.body;
    var authOptions = {
      method: 'POST',
      url: 'https://accounts.spotify.com/api/token',
      form: {
        // refresh_token: 'old_token',
        refresh_token: old_token,
        grant_type: 'refresh_token'
      },
      headers: {
        'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
    };

    // convert code into token
    rp(authOptions).
    then(function(body) {

      var newToken = {
        access_token: body.access_token,
      };

      ws.send(JSON.stringify(newToken));
    }).catch(function(err) {
      // TODO: when error redirect to login

      console.log(err);
      var error = {
        statusCode: err.statusCode,
        message: err.message
      };
      ws.send(JSON.stringify(error));
    });

  });
});



app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

// TODO set up security tests for all incoming and outgoing connections/posts
// for websocket
// var ip = req.headers.origin;
// console.log(ip);
// TODO check if html is needed in callback address on spotify also update readme
