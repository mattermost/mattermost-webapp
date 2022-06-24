// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import axios from 'axios';
import {Post} from '@mattermost/types/posts';

interface Options {
    sender: {
        username: string;
        password: string;
    };
    message: string;
    channelId: string;
    rootId?: string;
    createAt?: number;
    baseUrl: string;
}

export default async function postMessageAs(options: Options): Promise<{status: number; data: Post}> {
    const {sender, message, channelId, rootId, createAt = 0, baseUrl} = options;
    const loginResponse = await axios({
        url: `${baseUrl}/api/v4/users/login`,
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        method: 'post',
        data: {login_id: sender.username, password: sender.password},
    });

    const setCookie = loginResponse.headers['set-cookie'] as unknown as string[];
    let cookieString = '';
    setCookie.forEach((cookie) => {
        const nameAndValue = cookie.split(';')[0];
        cookieString += nameAndValue + ';';
    });

    let response: {status: number; data: Post};
    try {
        response = await axios({
            url: `${baseUrl}/api/v4/posts`,
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
                root_id: rootId,
            },
        });
    } catch (err) {
        if (err.response) {
            response = err.response;
        }
    }

    return {status: response.status, data: response.data};
}
