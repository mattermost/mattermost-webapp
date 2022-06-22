// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import axios, {Method} from 'axios';

interface Response {
    data: any;
    headers?: Record<string,string>;
    status: number;
    statusText: string;
}

interface Request {
    data: any;
    headers: Record<string, string>;
    method: Method;
    url: string;
}

export default async function clientRequest({data = {}, headers, method = 'get', url}: Request): Promise<Response> {
    let response: Response;

    try {
        response = await axios({
            data,
            headers,
            method,
            url,
        });
    } catch (error) {
        // If we have a response for the error, pull out the relevant parts
        if (error.response) {
            response = {
                status: error.response.status,
                statusText: error.response.statusText,
                data: error.response.data,
            };
        } else {
            // If we get here something else went wrong, so throw
            throw error;
        }
    }

    return {
        data: response.data,
        headers: response.headers,
        status: response.status,
        statusText: response.statusText,
    };
};
