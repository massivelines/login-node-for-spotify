var express = require('express');
var bodyParser = require("body-parser");
var http = require('http');
var request = require('request');
var rp = require('request-promise');
var expressWs = require('express-ws');

var app = express();
expressWs(app);

var client_id = process.env.CLIENT_ID;
var client_secret = process.env.CLIENT_SECRET;
var redirect_uri = process.env.REDIRECT_URI;


var host; //stores what page called node server
var scopes = []; //stores scopes
var token; //stores current token
var callbackClosedPopup = false; // set true if callback returned code 200 to close popup, used confirm for /token call
var dataRecived = false; // set to true when /data from js file is recived

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


// data sent when page loads, host scopes
app.post('/data', function(req, res) {
  host = req.body.hostURL;
  scopes = req.body.scopes;
  if (scopes) {
    dataRecived = true;
  }
  res.end();
});


// when login popup is called, redirecets it to correct url
app.get('/login', function(req, res) {
  // set token to null incase already had set info example logout and someone else loged in
  token = null;
  state = generateRandomString(16);

  // the loop makes sure scopes is populated before calling login redirect on the popup
  function loginRedirect() {
    if (scopes.length > 0) {
      var url = 'https://accounts.spotify.com/authorize?client_id=' + client_id +
        '&redirect_uri=' + encodeURIComponent(redirect_uri) +
        '&scope=' + encodeURIComponent(scopes.join(' ')) +
        '&response_type=code' +
        '&state=' + state +
        // can force user to approve scopes every time.
        '&show_dialog=true';
      res.redirect(url);
    } else {
      setTimeout(function() {
        loginRedirect();
      }, 500);
    }
  }

  // check to see if scopes have been populated by post to data
  if (dataRecived == true) {
    loginRedirect();
  } else {
    res.send('Error loging in. Scopes not populated. Close this window and try again');
  }

});

// callback from login popup, passes spotify response codes, to turn it into a token
app.post('/callback', function(req, res) {
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

      // send status code to close popup and set callbackClosedPopup to true
      callbackClosedPopup = true;
      res.sendStatus(200);
    }).catch(function(err) {
      res.sendStatus(400);
      console.log(err);
      console.log('error');
    });
  } else {
    console.log('states did not match or exist');
  }

});

// when callback closes popup with status code app.js opens a websocket to recive the tokens
app.ws('/token', function(ws, req) {

  function sendToken() {
    if (token) {
      ws.send(JSON.stringify(token));
    } else {
      setTimeout(sendToken, 500);
    }
  }

  // test to see if callback sent code 200 to close else send to close connection
  if (callbackClosedPopup == true) {
    sendToken();
  } else {
    ws.send(400);
  }

});

// called to refresh the access_token
app.ws('/refresh', function(ws, req) {
  ws.on('message', function(old_token) {

    old_token = JSON.parse(old_token);

    var data = req.body;
    var authOptions = {
      method: 'POST',
      url: 'https://accounts.spotify.com/api/token',
      form: {
        refresh_token: old_token,
        grant_type: 'refresh_token'
      },
      headers: {
        'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
    };

    // get newToken using refresh_token
    rp(authOptions)
      .then(function(body) {
        var newToken = {
          access_token: body.access_token,
        };
        ws.send(JSON.stringify(newToken));
      }).catch(function(err) {
        console.log(err);
        var error = {
          statusCode: '400',
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
