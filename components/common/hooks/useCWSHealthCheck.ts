// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Client4} from 'mattermost-redux/client';

export default function useCwsHealthCheck() {
    const cwsHealthCheck = async () => {
        return Client4.cwsHealthCheck();
    };

    return {
        cwsHealthCheck,
    };
}
