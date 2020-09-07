// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {Client4} from 'mattermost-redux/client';
import {IntegrationTypes} from 'mattermost-redux/action_types';

import {getCurrentChannelId, getCurrentUserId} from 'mattermost-redux/selectors/entities/common';
import {getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';

export function doPluginAction(pluginId, requestURL, values) {
    return async (dispatch, getState) => {
        const state = getState();
        const body = {
            request_url: requestURL,
            team_id: getCurrentTeamId(state),
            channel_id: getCurrentChannelId(state),
            user_id: getCurrentUserId(state),
            values,
        };

        const data = await Client4.executePluginIntegration(pluginId, body);
        dispatch({type: IntegrationTypes.RECEIVED_DIALOG_TRIGGER_ID, data: data.trigger_id});
    };
}
