var SpotifyHeroku = function() {

  var windowURL = window.location.origin;
  var autoRefreshTimeout;

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

          // calls fadeLogin with a 1 to hide, to show call with a 0
          fadeLogin(1);

        }
        ws.close();
      };
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

        var host = nodeHost.replace(/^https|^http/, 'ws');
        var ws = new WebSocket(host + '/token');

        ws.onmessage = function(message) {
          if (message.data == 400) {
            // user closed popup instead of loging in
            ws.close();
          } else {
            var token = JSON.parse(message.data);
            storage(token);
            // calls fadeLogin with a 1 to hide, to show call with a 0
            fadeLogin(1);
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
    refreshToken();
  };

  // sepperate function so can be called in other fuctions
  function refreshToken() {
    var host = nodeHost.replace(/^https|^http/, 'ws');
    var ws = new WebSocket(host + '/refresh');
    ws.onopen = function() {
      ws.send(JSON.stringify(localStorage.getItem('refresh_token')));
    };

    ws.onmessage = function(message) {
      // test if refresh was successful else console.log and show login
      var body = JSON.parse(message.data);
      if (body.access_token) {
        storage(body);
      } else {
        window.alert("Error getting refresh token check console");
        console.log(body);
        fadeLogin(0);
      }
      ws.close();
    };
  }
  //--------------end of refresh


  // LOGOUT - called to clear tokens and show login
  this.logout = function() {
    fadeLogin(0);
    clearTimeout(autoRefreshTimeout);
    localStorage.clear();
  }; //--------------end of logout




  // called to store tokens into localStorage
  function storage(token) {
    // calls autoRefresh everytime token is saved
    autoRefresh();
    for (var key in token) {
      localStorage.setItem(key, token[key]);
    }
  }

  function autoRefresh() {
    // token is good for 1 hour(3600), refresh 5 mins before
    var timer = 3300 * 1000;
    autoRefreshTimeout = setTimeout(function () {
      // creates a refresh token loop
      refreshToken();
    }, timer);
  }


  // fades login element value=1 will hide, value=0 will show
  function fadeLogin(value) {
    // interval is set to 10ms, reduce loginFade to how many times it will run;
    var loginFadeTime = loginFade / 10;

    // login element starts at opacity=1
    var currentOpaicty = value;

    // determins amount to subtract each time it loops
    var opacityStep = 1 / loginFadeTime;

    // get login element
    var loginDiv = document.getElementById('login');



    if (currentOpaicty == 1) {
      // sets visiable to pass it to fadeInterval and keep a constant var
      var visiable = currentOpaicty;
      // runs interval
      var fade = setInterval(function() {
        fadeInterval(visiable)
      }, 10);
    } else if (currentOpaicty == 0) {
      var visiable = currentOpaicty;
      var fade = setInterval(function() {
        fadeInterval(visiable)
      }, 10);
    }

    function fadeInterval(visiable) {
      if (visiable == 1) {
        // when opacity <= 0 set display=none
        if (currentOpaicty <= 0) {
          clearInterval(fade);
          loginDiv.setAttribute('style', 'display: none;');

          // then call main fuction on client side
          main();
          // else lower oppacity by opacityStep
        } else {
          currentOpaicty = currentOpaicty - opacityStep;
          loginDiv.setAttribute('style', 'opacity: ' + currentOpaicty + ';');
        }
      } else if (visiable == 0) {
        if (currentOpaicty >= 1) {
          clearInterval(fade);
          loginDiv.setAttribute('style', 'display: inherit;');
        } else {
          currentOpaicty = currentOpaicty + opacityStep;
          loginDiv.setAttribute('style', 'opacity: ' + currentOpaicty + ';');
        }
      }
    }

  } //--------------end of fadeLogin

  // runs init function at page load
  init();
};
