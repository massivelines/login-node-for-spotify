// This is an example setup file for your client side js file

var scopes = ['user-read-playback-state']; //scopes for permissions

// comment out the line you need
var nodeHost = 'http://localhost:5000'; //location of node server
// var nodeHost = 'https://<production_domain>.herokuapp.com'; //location of node server

// controls how long the login element fades in milliseconds
loginFade = 1000;

var spotify = new SpotifyHeroku(scopes, nodeHost, loginFade); //passes vars to new class

// when login is clicked run the login function and fades the login element then sets display=none
document.getElementById('login').addEventListener("click", function() {
  spotify.login();
});

// logout will clear tokens and force the login element to display=inherit
document.getElementById('logout').addEventListener("click", function() {
  spotify.logout();
});

// called to refresh token manually
spotify.refresh();

// to access the tokens use
var example1 = localStorage.getItem('access_token');
var example2 = localStorage.getItem('expires_in');
var example3 = localStorage.getItem('refresh_token');
