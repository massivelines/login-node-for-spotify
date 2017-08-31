var SpotifyHeroku = function(scopes) {
  this.scopes = scopes;
  // this.appHost = appHost;

  var client_id = '8d2ca6ffda244def9852f84650c2bfa2'; // Your client id
  var redirect_uri = 'http://localhost:5000/callback.html'; // Your redirect uri



  this.login = function() {
    var test = {
      tester: 'maybe',
      yep: 'nope'
    };
    // console.log(test);

    fetch('http://localhost:5000/test', {
    method: 'POST',
    body: test,
    mode: 'cors',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  }).then(function(response) {
    // console.log(response);
	  //  console.log('success');
}).catch(function(err) {
	// Error :(
  console.log(err);
  console.log('error');
});

    var url = 'http://localhost:5000/login';

    // var url = 'https://accounts.spotify.com/authorize?client_id=' + client_id +
    //   '&redirect_uri=' + encodeURIComponent(redirect_uri) +
    //   '&scope=' + encodeURIComponent(scopes.join(' ')) +
    //   '&response_type=code&show_dialog=true';

    // var width = 450,
    //   height = 730,
    //   left = screen.width / 2 - width / 2,
    //   top = screen.height / 2 - height / 2;

    // var w = window.open(
    //   url,
    //   'Spotify',
    //   'menubar=no,location=no,resizable=no,scrollbars=no,status=no,' +
    //   ' width=' + width +
    //   ', height=' + height +
    //   ', top=' + top +
    //   ', left=' + left
    // );

  };

};


window.addEventListener('message', function(event) {
  var hash = JSON.parse(event.data);
  console.log(hash);
  // if (hash.type == 'access_token') {
  //   resolve(hash.access_token);
  // }
}, false);

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
// -send token to browser by parsebody

// refresh
// -call function pass vars
// -fetch to node
// -send token to browser by parsebody
