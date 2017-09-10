var SpotifyHeroku = function() {

  var windowURL = window.location.origin;

  // runs at launch
  function init() {
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

    // TODO test for login localStorage
    // if contains refresh_token try first
    // if success hide login
    // if error do nothing

    if(localStorage.getItem('refresh_token')){
      console.log('refresh_token at startup');
      var ws = new WebSocket('ws://localhost:5000/refresh');
      ws.onopen = function () {
        ws.send(JSON.stringify(localStorage.getItem('refresh_token')));
      };

      ws.onmessage = function(message) {
        var newToken = JSON.parse(message.data);
        // checks for error code, if no error refresh token and hide login
        if(newToken.statusCode !== 400){
          console.log(newToken);
          storage(newToken);
          // hide login
          document.getElementById('login').style.display = 'none';
          launch();
        }
        // else {
        //   console.log(newToken);
        // }
        ws.close();
      };
    }

  }


  function storage(token) {
    // TODO determin if all are needed in storage or just access token
    for (var key in token){
      localStorage.setItem(key, token[key]);
    }
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
          console.log('logged in');
          ws.close();
        };
      } else {
        setTimeout(popupClosed, 500);
      }
    }
    popupClosed();



  }; //--------------end of login

  this.refresh = function () {
    var ws = new WebSocket('ws://localhost:5000/refresh');
    ws.onopen = function () {
      ws.send(JSON.stringify(localStorage.getItem('refresh_token')));
    };

    ws.onmessage = function(message) {
      var newToken = JSON.parse(message.data);
      console.log(newToken);
      storage(newToken);
      console.log('refresh');
      ws.close();
    };
  };//--------------end of refresh

  this.logout = function () {
    localStorage.clear();
  };//--------------end of logout

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
