// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

const axios = require('axios');

module.exports = async ({url, data}) => {
    let success;
    let error;
    let response;

    try {
        response = await axios({method: 'post', url, data});
        success = true;
    } catch (err) {
        error = err;
    }

    return {body: JSON.stringify(response.body), success, error};
};
