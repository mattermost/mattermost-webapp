# Testing with subpath servers
Some tests need multiple servers running in subpath mode. These tests have the cypress `Group: @subpath` metadata near the top of the test file. Instructions on running a server under subpath can be found here: [https://developers.mattermost.com/blog/subpath/](https://developers.mattermost.com/blog/subpath/)

In the `cypress.json` configuration file, the `baseURL` setting will need to be updated with the subpath URL of the first server, and the `secondServerURL` setting with the subpath URL of the second server.

### Running subpath tests on local machine
Two mattermost servers running on the same machine must be served from different ports. To have the servers respond on the same URL and the same port under different subpaths, you will need to use a reverse proxy (nginx or apache) to proxy the same local url to both mattermost servers under different subpaths.
