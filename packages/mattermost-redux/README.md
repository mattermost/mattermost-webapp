# Mattermost Redux ![CircleCI branch](https://img.shields.io/circleci/project/github/mattermost/mattermost-redux/master.svg)

The project purpose is consolidating the storage, web utilities and logic of the webapp and React Native mobile clients into a single driver. We encourage you to use mattermost-redux to power your own Mattermost clients or integrations.

[Redux](http://redux.js.org/docs/introduction/) is the backbone for this project and many of the design decisions and patterns stem from it.

Mattermost is an open source Slack-alternative used by thousands of companies around the world in more than 16 languages. Learn more at https://mattermost.com.

# Usage

### Basic Usage

To hook up your application to the mattermost-redux store:

```
import configureServiceStore from 'mattermost-redux/store';

configureServiceStore(yourInitialState, yourAppReducers, yourOfflineOptions);

const store = configureStore();

// use store
```

* `yourInitialState` - any initial state for any extra reducers you may have (set to `{}` if none)
* `yourAppReducers` - any reducers from your app (set to `{}` if none)
* `yourOfflineOptions` - any offline options, specified using [this redux-offline configuration object](https://github.com/jevakallio/redux-offline#configuration-object)

### Web Client Usage

If you're only looking to use the v4 JavaScript web client for the Mattermost server:

With async/await:
```
import {Client4} from 'mattermost-redux/client';

Client4.setUrl('https://your-mattermost-url.com');

async function loginAndGetUser(username, password) {
    try {
        await Client4.login(username, password);
    } catch (error) {
        console.error(error);
        return null;
    }

    let user;
    try {
        user = await Client4.getMe();
    } catch (error) {
        console.error(error);
        return null;
    }

    return user;
}

```

With promises:
```
import {Client4} from 'mattermost-redux/client';

Client4.setUrl('https://your-mattermost-url.com');

function loginAndGetUser(username, password, callback) {
    Client4
        .login(username, password)
        .then(Client4.getMe)
        .then(callback)
        .catch(console.error);
}
```

If you already have a [personal access token](https://docs.mattermost.com/guides/developer/personal-access-tokens.html) or session token, you can set the token manually instead of logging in:

```
import {Client4} from 'mattermost-redux/client';

Client4.setUrl('https://your-mattermost-url.com');
Client4.setToken(yourToken);
```

### Browser Usage

To build a browser-compatible client via `webpack`:

```
$ git clone <this repo>
$ cd mattermost-redux
$ make bundle
```

This will generate `lib/mattermost.client4.js`, and `lib/mattermost.websocket.js` which can be loaded in a browser. Also note that `babel-polyfill` is required.

```
<script src="/path/to/babel/polyfill.js"></script>
<script src="/path/to/mattermost.client4.js"></script>
<script src="/path/to/mattermost.websocket.js"></script>
<script type="text/javascript">
    const client = Mattermost.client4.default();
    const wsClient = Mattermost.websocket.default;
    var token;
    client.setUrl('https://your-mattermost-url.com');
    /* use an existing personal access token */
    client.setToken('yourToken');
    client.setIncludeCookies(false);
    /* login and obtain a token */
    client.login(username, password)
    .then(function(user){
        console.log(`Logged in as ${user.email}`);
        token = client.getToken();
    })
    .then(function(){
        wsClient.initialize(token, {}, {}, {connectionUrl: 'wss://your-mattermost-url.com/api/v4/websocket'});
    })
    .catch(function(err){
        console.error(err);
    });
</script>
```

### node.js Usage

Running the client from node.js requires making the `fetch` and `WebSocket` packages globally available, and the use of `babel-polyfill`:

```
require('babel-polyfill');
require('isomorphic-fetch');
if (!global.WebSocket) {
    global.WebSocket = require('ws');
}
const Client4 = require('./client/client4.js').default;
const client = new Client4;
const wsClient = require('./client/websocket_client.js').default;
var token;

wsClient.setEventCallback(function(event){
    console.log(event);
});

client.setUrl('https://your-mattermost-url.com');
client.login(username, password)
.then(function(me){
    console.log(`logged in as ${me.email}`);
    token = client.getToken();
})
.then(function(){
    wsClient.initialize(token, {}, {}, {connectionUrl: 'wss://your-mattermost-url.com/api/v4/websocket'});
})
.catch(function(err){
    console.error(err);
});
```

# How to Contribute

### How to Build mattermost-redux

You only need to build mattermost-redux if you are developing it. 

#### Webapp Development
If your mattermost-webapp and mattermost-redux are in the same directory, you only 
need to run `npm run dev` or `npm run dev:watch`.
 
If you have mattermost-webapp in other directory or you are developing your own 
application, you can define the environment variable `WEBAPP_DIR` to change the 
destination app
(e. g. `WEBAPP_DIR=/tmp/mattermost-webapp`).

#### React Native (Mobile) Development
If your mattermost-mobile and mattermost-redux are in the same directory, you only 
need to run `npm run dev-mobile` or `npm run dev-mobile:watch`.
 
If you have mattermost-mobile in other directory or you are developing your own 
application, you can define the environment variable `MOBILE_DIR` to change the 
destination app
(e. g. `MOBILE_DIR=/tmp/mattermost-mobile`).

#### Resetting apps to use package redux
If you want to go back to using the package specified redux in your web or mobile
app you can stop the server and run `rm -rf .npminstall` to force
your project to reset to the specified package version on next server start.  

### Contribute Code

If you're contributing to help [migrate the webapp to Redux](https://docs.mattermost.com/developer/webapp-to-redux.html) go ahead and submit your PR. If you're just fixing a small bug or adding a small improvement then feel free to submit a PR for it. For everything else, please either work on an issue labeled `[Help Wanted]` or open an issue if there's something else that you'd like to work on.

Feel free to drop by [the Redux channel](https://pre-release.mattermost.com/core/channels/redux) on our Mattermost instance.

### Running the Tests

`make test` will run the unit tests against a mocked server.
