// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

const axios = require('axios');

const cypressConfig = require('../../cypress.json');

module.exports = async ({username}) => {
    const mailboxUrl = cypressConfig.mailboxAPI + username;
    let response;
    let recentEmail;

    try {
        response = await axios({url: mailboxUrl, method: 'get'});
        recentEmail = response.data[response.data.length - 1];
    } catch (error) {
        return {status: error.status, data: null};
    }

    let recentEmailMessage;
    const mailMessageUrl = `${mailboxUrl}/${recentEmail.id}`;
    try {
        response = await axios({url: mailMessageUrl, method: 'get'});
        recentEmailMessage = response.data;
    } catch (error) {
        return {status: error.status, data: null};
    }

    return {status: response.status, data: recentEmailMessage};
};
