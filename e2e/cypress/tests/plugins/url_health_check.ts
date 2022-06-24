// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import axios, {Method} from 'axios';

interface UrlHealthCheckSuccess {
    data: any;
    status: number;
    success: true;
}
interface UrlHealthCheckFailure {
    errorCode: number;
    success: false;
}

export default async function urlHealthCheck({url, method}: {url: string; method: Method}): Promise<UrlHealthCheckSuccess | UrlHealthCheckFailure> {
    try {
        const response = await axios({url, method});
        return {data: response.data, status: response.status, success: true};
    } catch (err) {
        return {success: false, errorCode: err.code};
    }
}
