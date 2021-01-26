// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

const axios = require('axios');

const timeouts = require('../fixtures/timeouts');

module.exports = async ({baseUrl, user, method = 'get', path, data = {}}) => {
    const loginUrl = `${baseUrl}/api/v4/users/login`;

    // First we need to login with our external user to get cookies/tokens
    let cookieString = '';
    try {
        const response = await axios({
            url: loginUrl,
            headers: {'X-Requested-With': 'XMLHttpRequest'},
            method: 'post',
            timeout: timeouts.TEN_SEC,
            data: {login_id: user.username, password: user.password},
        });

        const setCookie = response.headers['set-cookie'];
        setCookie.forEach((cookie) => {
            const nameAndValue = cookie.split(';')[0];
            cookieString += nameAndValue + ';';
        });
    } catch (error) {
        return getErrorResponse(error);
    }

    try {
        const response = await axios({
            method,
            url: `${baseUrl}/api/v4/${path}`,
            headers: {
                'Content-Type': 'text/plain',
                Cookie: cookieString,
                'X-Requested-With': 'XMLHttpRequest',
            },
            timeout: timeouts.TEN_SEC,
            data,
        });

        return {
            status: response.status,
            statusText: response.statusText,
            data: response.data,
        };
    } catch (error) {
        // If we have a response for the error, pull out the relevant parts
        return getErrorResponse(error);
    }
};

function getErrorResponse(error) {
    if (error.response) {
        return {
            status: error.response.status,
            statusText: error.response.statusText,
            data: error.response.data,
            isError: true,
        };
    } else if (error.code === 'ECONNABORTED') {
        return {data: {id: error.code, isTimeout: true}};
    }

    // If we get here something else went wrong, so throw
    throw error;
}
