// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import axios, {AxiosResponse} from 'axios';
interface PostBotMessageArg {
    token: string;
    message: string;
    props: Record<string, any>
    channelId: string;
    rootId: string;
    createAt: number;
    baseUrl: string;
}
export default async function postBotMessage(arg: PostBotMessageArg) {
    const {token, message, props = {}, channelId, rootId, createAt = 0, baseUrl} = arg;
    let response: AxiosResponse<any>;
    try {
        response = await axios({
            url: `${baseUrl}/api/v4/posts`,
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                Authorization: `Bearer ${token}`,
            },
            method: 'post',
            data: {
                channel_id: channelId,
                message,
                props,
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
};
