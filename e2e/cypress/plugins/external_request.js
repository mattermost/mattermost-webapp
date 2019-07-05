// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

const axios = require('axios');

module.exports = async ({baseUrl, user, method = 'get', path, data = {}}) => {
    const loginUrl = `${baseUrl}/api/v4/users/login`;

    // First we need to login with our external user to get cookies/tokens
    const loginResponse = await axios({
        url: loginUrl,
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        method: 'post',
        data: {login_id: user.username, password: user.password},
    });

    let cookieString = '';
    const setCookie = loginResponse.headers['set-cookie'];
    setCookie.forEach((cookie) => {
        const nameAndValue = cookie.split(';')[0];
        cookieString += nameAndValue + ';';
    });

    let response = {status: null, data: {}, error: {}};

    try {
        response = await axios({
            method,
            url: `${baseUrl}/api/v4/${path}`,
            headers: {
                'Content-Type': 'text/plain',
                Cookie: cookieString,
                'X-Requested-With': 'XMLHttpRequest',
            },
            data,
        });
    } catch (error) {
        if (error.response) {
            response = error.response;
        }
    }

    return {status: response.status, data: response.data, error: response.error};
};
