// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

const axios = require('axios');

const cypressConfig = require('../../cypress.json');

module.exports = async ({sender, message, channelId, createAt = 0}) => {
    const loginResponse = await axios({
        url: `${cypressConfig.baseUrl}/api/v4/users/login`,
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        method: 'post',
        data: {login_id: sender.username, password: sender.password},
    });

    const setCookie = loginResponse.headers['set-cookie'];
    let cookieString = '';
    setCookie.forEach((cookie) => {
        const nameAndValue = cookie.split(';')[0];
        cookieString += nameAndValue + ';';
    });

    const response = await axios({
        url: `${cypressConfig.baseUrl}/api/v4/posts`,
        headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            Cookie: cookieString,
        },
        method: 'post',
        data: {
            channel_id: channelId,
            message,
            type: '',
            create_at: createAt,
        },
    });

    return {status: response.status, data: response.data, error: response.error};
};
