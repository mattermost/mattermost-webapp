// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

require('@babel/polyfill');
require('isomorphic-fetch');

const {Client4} = require('mattermost-redux/client');
const axios = require('axios');

const cypressConfig = require('../../cypress.json');

module.exports = async ({sender, message, channelId, createAt = 0}) => {
    const url = `${cypressConfig.baseUrl}/api/v4/users/login`;

    const response = await axios({
        url,
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        method: 'post',
        data: {login_id: sender.username, password: sender.password},
    });

    const token = response.headers.token;

    Client4.setUrl(cypressConfig.baseUrl);
    Client4.setToken(token);

    const options = {
        channel_id: channelId,
        message,
        type: '',
        create_at: createAt,
    };

    return Client4.createPost(options);
};
