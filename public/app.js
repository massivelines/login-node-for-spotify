var SpotifyHeroku = function() {

  var windowURL = window.location.origin;

  function init() {

  }
  // sends scopes and main url of page to node server
  fetch(nodeHost + '/data', {
    method: 'POST',
    body: JSON.stringify({
      scopes: scopes,
      hostURL: windowURL
    }),
    headers: {
      'Content-Type': 'application/json'
    }
  }).catch(function(err) {
    // Error :(
    console.log(err);
    console.log('error');
  });

  function storage(token) {
    localStorage.setItem('access_token', token.access_token);
    localStorage.setItem('expires_in', token.expires_in);
    localStorage.setItem('refresh_token', token.refresh_token);
  }


  this.login = function() {

    // then opens a popup window to login into, that sends info back to the node server
    var url = nodeHost + '/login';

    var width = 450,
      height = 730,
      left = screen.width / 2 - width / 2,
      top = screen.height / 2 - height / 2;

    var popup;

    popup = window.open(
      url,
      'Spotify',
      'menubar=no,location=no,resizable=no,scrollbars=no,status=no,' +
      ' width=' + width +
      ', height=' + height +
      ', top=' + top +
      ', left=' + left
    );

    // when the popu closes, then get the tokens
    function popupClosed() {
      if (popup.closed) {
        // TODO secure websockets
        // var HOST = nodeHost.replace(/^http/, 'ws');
        var ws = new WebSocket('ws://localhost:5000/token');

        ws.onmessage = function(message) {
          var token = JSON.parse(message.data);
          storage(token);
          ws.close();
        };
      } else {
        setTimeout(popupClosed, 500);
      }
    }
    popupClosed();



  }; //--------------end of login


  init();
};




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
