// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {Client4} from 'mattermost-redux/client';

export async function doPluginAction(pluginId, requestURL, body) {
    await Client4.executePluginIntegration(pluginId, requestURL, body);

    // TODO: Add actions
}
