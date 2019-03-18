// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

require('@babel/polyfill');
require('isomorphic-fetch');

const {Client4} = require('mattermost-redux/client');
const axios = require('axios');

const cypressConfig = require('../../cypress.json');

module.exports = async ({sender, message, channelId}) => {
    const url = `${cypressConfig.baseUrl}/api/v4/users/login`;

    const response = await axios({url, method: 'post', data: {login_id: sender.username, password: sender.password}});
    const token = response.headers.token;

    Client4.setUrl(cypressConfig.baseUrl);
    Client4.setToken(token);

    return Client4.createPost({
        channel_id: channelId,
        message,
        type: '',
    });
};