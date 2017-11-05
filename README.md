# Login Node for Spotify

A node.js remote server built to log into the Spotify API. It is setup for minimal calls. It passes the response token to the browser, so that the browser can be used for the API calls.  

When the login popup is called, node redirects the popup address for the user to login to Spotify. After the user logs in and approves the access scopes  the popup sends the data to node, node then returns with a code. That code is then sent back to Spotify with the client id and secret to be authenticated. A return object containing tokens are then returned to node and stored in local storage to be used by the client side.

## Getting Started

The server must be setup correctly. Then add the correct javascript to the client side.

### Servers
The server can be run locally and also deployed to Heroku. You will need to register your own Spotify app and pass the credentials to the server. For that:

1. Create an application on [Spotify's Developer Site](https://developer.spotify.com/my-applications/).
2. Add as redirect URIs both `http://localhost:5000/callback.html` (for development) and `<production_domain>/callback.html` (if you want to deploy your app somewhere)
3. Keep the client ID and client secret somewhere. You'll need them next.



#### Running Locally
Install [Node.js](http://nodejs.org/) if you don't have it already.

```sh
cd into directory
------------------
npm install
set CLIENT_ID=<your_client_id>
set CLIENT_SECRET=<your_client_secret>
set REDIRECT_URI=<your_redirect_uri>
npm start
```

Link the js file at the end of the body on the html file:
```html
<script src="http://localhost:5000/spotifyLogin.js"></script>
```

Your app should now be running on [localhost:5000](http://localhost:5000/).

#### Remote Server

If you dont already have an account with [Heroku](https://www.heroku.com/) create one.
1. Clone this repository
2. Create a new app
3. Use GitHub as a deployment method
4. Deploy master branch

Under Settings and Config Variables add
```
key <value>
------------------
CLIENT_ID <your_client_id>
CLIENT_SECRET <your_client_secret>
REDIRECT_URI <your_redirect_uri>
```



Link the js file at the end of the body on the html file:
```html
<script src="https://<your-app-name>.herokuapp.com/spotifyLogin.js"></script>
```

## Client Side
Define your server and scopes
```js
var scopes = ['...']; //scopes for permissions
// example 'user-read-playback-state'

var nodeHost = '...'; //location of node server
// example: 'http://localhost:5000' or 'https://<your-app-name>.herokuapp.com'


var spotify = new SpotifyHeroku(scopes, nodeHost); //passes vars to class

```
Calls to initiate the function
```js
//starts login and launches popup
//login will hide the element with the ID of 'login'
spotify.login();

//logout will show the element with the ID of 'login'
//clears localStorage and stops some loops
spotify.logout();

//optional can force a token refresh
spotify.refresh();

```
Call Example
```js
document.getElementById('login').addEventListener("click", function() {
  spotify.login();
});
```
main function is called when the user has successfully logged in
```js
// called from spotifyLogin.js after logged in
function main() {

}
```

After the login is successful, the node server will pass the tokens into the clients local storage using web sockets. To access them just call

```js
var example1 = localStorage.getItem('access_token');
var example2 = localStorage.getItem('expires_in');
var example3 = localStorage.getItem('refresh_token');
```

After receiving the tokens you are ready to access the Spotify api endpoints.
Check the clientSideExample folder for a setup example.  

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Inspiration from
[spotify-player](https://github.com/JMPerez/spotify-player)

TODO: heroku deploy launch button  
TODO: if new scopes force new login  
