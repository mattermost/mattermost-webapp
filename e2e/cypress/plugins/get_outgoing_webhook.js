// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

const axios = require('axios');

module.exports = async ({url}) => {
    let response;

    try {
        response = await axios({method: 'get', url});
    } catch (err) {
        if (err.response) {
            response = err.response;
        }
    }

    return {status: response.status, data: response.data};
};