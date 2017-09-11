var SpotifyHeroku = function() {

  var windowURL = window.location.origin;

  // runs at page load
  function init() {

    // sends scopes and main url of page to the node server
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
      window.alert('An error has occurred\nPlease check the console log');
      console.log(err);
      console.log('error');
    });

    // tests to see if there is a refresh token already
    // and if it can be used, refresh current token and hide login
    // else do nothing
    if (localStorage.getItem('refresh_token')) {

      // strips the http and https replace with ws for websocket
      var host = nodeHost.replace(/^https|^http/, 'ws');

      // opens websockets to recive tokens from node server
      var ws = new WebSocket(host + '/refresh');
      ws.onopen = function() {
        ws.send(JSON.stringify(localStorage.getItem('refresh_token')));
      };

      ws.onmessage = function(message) {
        var newToken = JSON.parse(message.data);

        // if error code 400 is not recived a new token has been recived
        if (newToken.statusCode !== 400) {
          storage(newToken);
          // hide login
          document.getElementById('login').style.display = 'none';
          launch();
        }
        ws.close();
      };
    }

  }


  // called to store tokens into localStorage
  function storage(token) {
    for (var key in token) {
      localStorage.setItem(key, token[key]);
    }
  }


  // LOGIN - opens popup at nodeHost/login then node redirects and popup sends node information
  this.login = function() {
    // sets vars for popup
    var url = nodeHost + '/login';

    var width = 450,
      height = 730,
      left = screen.width / 2 - width / 2,
      top = screen.height / 2 - height / 2;

    // open popup
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

    /**
     * popup gets callback url info and sends it to node /callback
     * node returns status to popup when it recives a response from spotify
     * if correct data close popup
     **/

    // when popup lauches, start loop to test for closed status
    // when the popup closes call node /token
    // changes the code recived from /callback to a token
    // then calls storage() to save tokens in localStorage
    function popupClosed() {
      if (popup.closed) {
        // TODO secure websockets

        var host = nodeHost.replace(/^https|^http/, 'ws');
        var ws = new WebSocket(host + '/token');

        ws.onmessage = function(message) {
          if (message.data == 400) {
            // user closed popup instead of loging in
            ws.close();
          } else {
            var token = JSON.parse(message.data);
            storage(token);
            document.getElementById('login').style.display = 'none';
            ws.close();
          }

        };
      } else {
        setTimeout(popupClosed, 500);
      }
    }
    popupClosed();

  }; //--------------end of login

  // REFRESH - called to refesh the access_token
  this.refresh = function() {
    var host = nodeHost.replace(/^https|^http/, 'ws');
    var ws = new WebSocket(host + '/refresh');
    ws.onopen = function() {
      ws.send(JSON.stringify(localStorage.getItem('refresh_token')));
    };

    ws.onmessage = function(message) {
      // test if refresh was successful else console.log and show login
      var body = JSON.parse(message.data);
      if (body.access_token) {
        storage(body.access_token);
      } else {
        window.alert("Error getting refresh token check console");
        console.log(body);
        document.getElementById('login').style.display = 'inherit';
      }
      ws.close();
    };
  }; //--------------end of refresh


  // LOGOUT - called to clear tokens and show login
  this.logout = function() {
    document.getElementById('login').style.display = 'inherit';
    localStorage.clear();
  }; //--------------end of logout


  // runs init function at page load
  init();
};
