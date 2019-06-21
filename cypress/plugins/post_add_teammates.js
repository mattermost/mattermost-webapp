// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

require('@babel/polyfill');
require('isomorphic-fetch');

const {Client4} = require('mattermost-redux/client');
const axios = require('axios');

const cypressConfig = require('../../cypress.json');

module.exports = async ({admin, teamId, userIds}) => {
    const url = `${cypressConfig.baseUrl}/api/v4/users/login`;

    const response = await axios({
        url,
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        method: 'post',
        data: {login_id: admin.username, password: admin.password},
    });

    const token = response.headers.token;

    Client4.setUrl(cypressConfig.baseUrl);
    Client4.setToken(token);

    return Client4.addUsersToTeam(teamId, userIds);
};
