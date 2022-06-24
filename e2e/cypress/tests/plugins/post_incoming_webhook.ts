// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import axios, {AxiosResponse} from 'axios';

export default async function postIncomingWebhook({url, data}) {
    let response: AxiosResponse<any>;

    try {
        response = await axios({method: 'post', url, data});
    } catch (err) {
        if (err.response) {
            response = err.response;
        }
    }

    return {status: response.status, data: response.data};
}
