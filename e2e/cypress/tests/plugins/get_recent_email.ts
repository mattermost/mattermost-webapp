// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import axios from 'axios';

export default async function getRecentEmail({username, mailUrl}: {username: string; mailUrl: string}): Promise<{status: number; data: null | any}> {
    const mailboxUrl = `${mailUrl}/${username}`;
    let response: any;
    let recentEmail: any;

    try {
        response = await axios({url: mailboxUrl, method: 'get'});
        recentEmail = response.data[response.data.length - 1];
    } catch (error) {
        return {status: error.status, data: null};
    }

    if (!recentEmail || !recentEmail.id) {
        return {status: 501, data: null};
    }

    let recentEmailMessage: any;
    const mailMessageUrl = `${mailboxUrl}/${recentEmail.id}`;
    try {
        response = await axios({url: mailMessageUrl, method: 'get'});
        recentEmailMessage = response.data;
    } catch (error) {
        return {status: error.status, data: null};
    }

    return {status: response.status, data: recentEmailMessage};
};
