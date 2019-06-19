// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

const axios = require('axios');

const cypressConfig = require('../../cypress.json');

module.exports = async ({user, method = 'get', path, data = {}}) => {
    const loginUrl = `${cypressConfig.baseUrl}/api/v4/users/login`;

    // First we need to login with our external user to get cookies/tokens
    const loginResponse = await axios({
        url: loginUrl,
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        method: 'post',
        data: {login_id: user.username, password: user.password},
    });

    const setCookie = loginResponse.headers['set-cookie'];

    let cookieString = '';
    const cookies = {};

    setCookie.forEach((cookie) => {
        const nameAndValue = cookie.split(';')[0];
        cookieString += nameAndValue + ';';
        const [name, value] = nameAndValue.split('=');
        cookies[name] = value;
    });

    let response;

    try {
        response = await axios({
            method,
            url: `${cypressConfig.baseUrl}/api/v4/${path}`,
            headers: {
                'Content-Type': 'text/plain',
                Cookie: cookieString,
                'X-Requested-With': 'XMLHttpRequest',
                'X-CSRF-Token': cookies.MMCSRF,
            },
            data,
        });
    } catch (error) {
        response = error;
    }

    return {status: response.status, data: response.data, error: response.error};
};
