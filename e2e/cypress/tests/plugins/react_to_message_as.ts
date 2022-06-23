// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import axios, {AxiosResponse} from "axios";

interface ReactToMessageAsArg {
    sender: {
        id: string;
        username: string;
        password: string;
    };
    postId: string;
    reaction: string;
    baseUrl: string;
}
export default async function reactToMessageAs(arg: ReactToMessageAsArg) {
    const {sender, postId, reaction, baseUrl} = arg;
    const loginResponse = await axios({
        url: `${baseUrl}/api/v4/users/login`,
        headers: {'X-Requested-With': 'XMLHttpRequest'},
        method: 'post',
        data: {login_id: sender.username, password: sender.password},
    });

    const setCookie = loginResponse.headers['set-cookie'];
    let cookieString = '';
    (setCookie as any).forEach((cookie: string) => {
        const nameAndValue = cookie.split(';')[0];
        cookieString += nameAndValue + ';';
    });

    let response: AxiosResponse<any>;
    try {
        response = await axios({
            url: `${baseUrl}/api/v4/reactions`,
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                Cookie: cookieString,
            },
            method: 'post',
            data: {
                user_id: sender.id,
                post_id: postId,
                emoji_name: reaction,
            },
        });
    } catch (err) {
        if (err.response) {
            response = err.response;
        }
    }

    return {status: response.status, data: response.data};
};
