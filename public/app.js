var SpotifyHeroku = function(scopes, nodeHost) {
  this.scopes = scopes;

  var windowURL = window.location.origin;


  this.login = function() {

    fetch('http://localhost:5000/data', {
      method: 'POST',
      body: JSON.stringify({
        scopes: scopes,
        hostURL: windowURL
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    }).then(function(response) {
      console.log(response);
    }).catch(function(err) {
      // Error :(
      console.log(err);
      console.log('error');
    });

    var url = 'http://localhost:5000/login';

    var width = 450,
      height = 730,
      left = screen.width / 2 - width / 2,
      top = screen.height / 2 - height / 2;

    var w = window.open(
      url,
      'Spotify',
      'menubar=no,location=no,resizable=no,scrollbars=no,status=no,' +
      ' width=' + width +
      ', height=' + height +
      ', top=' + top +
      ', left=' + left
    );

  };

};


window.addEventListener('message', function(event) {
  var hash = JSON.parse(event.data);
  console.log(hash);
}, false);

// this.login = function() {
//   console.log(scopes);
//   var test = {
//     tester: 'maybe',
//     yep: 'nope'
//   };
//
//   fetch('http://localhost:5000/data', {
//     method: 'POST',
//     body: JSON.stringify(scopes),
//     // mode: 'cors',
//     headers: {
//       // 'Accept': 'application/json',
//       'Content-Type': 'application/json'
//     }
//   }).then(function(response) {
//     return response.json();
//   }).then(function(data) {
//     console.log(data);
//   }).catch(function(err) {
//     // Error :(
//     console.log(err);
//     console.log('error');
//   });

// login
// need to open popup from node?????
// -open webstocket
// -pass scopes
// -return success
// -launch login popup
// -sucess exchange code for token ect
// -pass token ect to browser
// -close webstocket

// refresh token
// -open webstocket
// -call POST
// -close webstocket

// or

// login
// -fetch from app.js
// -pass scopes
// -return success
// -launch login popup
// -send code ect to node throuh fetch
// -send token to browser by parsebody????

// refresh
// -call function pass vars
// -fetch to node
// -send token to browser by parsebody
