// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

const axios = require('axios');
module.exports = async ({sender, token, message, props = {}, channelId, rootId, createAt = 0, baseUrl}) => {
    const auth = {};

     if (token) {
         auth.Authorization = `Bearer ${token}`;
     } else if (sender) {
         const loginResponse = await axios({
             url: `${baseUrl}/api/v4/users/login`,
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

         auth.Cookie = cookieString;
     }
    let response;
    try {
        response = await axios({
            url: `${baseUrl}/api/v4/posts`,
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                auth,
            },
            method: 'post',
            data: {
                channel_id: channelId,
                message,
                props,
                type: '',
                create_at: createAt,
                parent_id: rootId,
                root_id: rootId,
            },
        });
    } catch (err) {
        if (err.response) {
            response = err.response;
        }
    }

    return {status: response.status, data: response.data};
};
