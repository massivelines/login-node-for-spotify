var express = require('express');
var bodyParser = require("body-parser");

var app = express();

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());



app.all('*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Cache-Control, Pragma, Origin, Authorization, Content-Type, X-Requested-With");
  res.header("Access-Control-Allow-Methods", "GET, PUT, POST, OPTIONS");
  next();
});

app.post('/', function(request, response){
  console.log(request.body);      // your JSON
   response.send(request.body);    // echo the result back
});

// app.use(function (req, res) {
//   res.setHeader('Content-Type', 'application/json');
//   res.write('you posted:\n');
//   res.end(JSON.stringify(req.body, null, 2));
//   console.log(req.body);
// });


// app.get('/login', function(req, res) {
//   console.log('login');
//   var scopes = ['user-read-playback-state'];
//   var client_id = '8d2ca6ffda244def9852f84650c2bfa2'; // Your client id
//   var redirect_uri = 'http://localhost:5000/callback.html'; // Your redirect uri
//
//   var url = 'https://accounts.spotify.com/authorize?client_id=' + client_id +
//     '&redirect_uri=' + encodeURIComponent(redirect_uri) +
//     '&scope=' + encodeURIComponent(scopes.join(' ')) +
//     '&response_type=code&show_dialog=true';
//   res.redirect(url);
// });

// app.get('/callback', function(req, res) {
  // console.log('called');
  // res.send('Hello World!');
  // var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
  // console.log(fullUrl);
  // res.end();
// });

app.post('/test', function(req, res) {
  console.log(req.body); // populated!
  res.send(req.body);
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
