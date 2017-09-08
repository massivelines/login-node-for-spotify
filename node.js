var express = require('express');
var bodyParser = require("body-parser");
var http = require('http');

var app = express();

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


app.get('/login', function(req, res) {
  console.log('login');

  // TODO: convert to system vars
  var scopes = ['user-read-playback-state'];
  var client_id = '8d2ca6ffda244def9852f84650c2bfa2'; // Your client id
  var client_secret = '5e1882b5faba4be4b3db73e9b72ac565';
  var redirect_uri = 'http://localhost:5000/callback.html'; // Your redirect uri

  var url = 'https://accounts.spotify.com/authorize?client_id=' + client_id +
    '&redirect_uri=' + encodeURIComponent(redirect_uri) +
    '&scope=' + encodeURIComponent(scopes.join(' ')) +
    '&response_type=code&show_dialog=true';
  res.redirect(url);
});

app.post('/callback', function(req, res) {
  var data = req.body;




  console.log(data);
  console.log('callback called');
  res.sendStatus(200);
});



// app.post('/test', function(req, res) {
//   var test = req.body;
//   console.log(test);
//   res.send(test);
// });

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
