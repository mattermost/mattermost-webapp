// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {Client4} from 'mattermost-redux/client';

export async function doPluginCall(call) {
    return await Client4.executePluginCall(call);

    // TODO: Add actions (may need to handle in the calling component)
}
