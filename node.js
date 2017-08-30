var express = require('express');

var app = express();


app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

app.all('*', function(req,res,next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Cache-Control, Pragma, Origin, Authorization, Content-Type, X-Requested-With");
  res.header("Access-Control-Allow-Methods", "GET, PUT, POST, OPTIONS");
  next();
});

app.get('/login', function(req, res) {
  res.send('Hello World!');
});

app.get('/callback', function(req, res) {
  console.log('called');
  // res.send('Hello World!');
  // var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
  // console.log(fullUrl);
  // res.end();
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
