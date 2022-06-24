// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Method} from 'axios';

import Client4 from 'mattermost-redux/client/client4';

import clientRequest from '../plugins/client_request';

export class E2EClient extends Client4 {
    constructor() {
        super();
        this.doFetchWithResponse = async (url: string, options: any) => {
            const {
                body,
                headers,
                method,
            } = this.getOptions(options);

            let data: any;
            if (body) {
                data = JSON.parse(body);
            }

            const response = await clientRequest({
                headers,
                url,
                method: method as Method,
                data,
            });

            if (url.endsWith('/api/v4/users/login')) {
                this.setToken(response.headers.token);
                this.setUserId(response.data.id);
                this.setUserRoles(response.data.roles);
            }
            const responseHeaders = new Map();

            Object.entries(response.headers).forEach(([k, v]) => {
                responseHeaders.set(k, v);
            });
            return {
                ...response,
                response: response.data,
                headers: responseHeaders,
            };
        }
    }
}
