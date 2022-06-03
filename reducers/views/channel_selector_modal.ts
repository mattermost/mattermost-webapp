// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {combineReducers} from 'redux';

import type {GenericAction} from 'mattermost-redux/types/actions';
import type {Channel} from '@mattermost/types/channels';

import {ChannelTypes, UserTypes} from 'mattermost-redux/action_types';

function channels(state: string[] = [], action: GenericAction) {
    switch (action.type) {
    case ChannelTypes.RECEIVED_ALL_CHANNELS:
        return action.data.map((v: Channel) => v.id);
    case UserTypes.LOGOUT_SUCCESS:
        return [];
    default:
        return state;
    }
}

export default combineReducers({
    channels,
});
