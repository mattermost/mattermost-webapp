// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {combineReducers} from 'redux';

import {ChannelTypes} from 'mattermost-redux/action_types';

import {GenericAction} from 'mattermost-redux/types/actions';
import {ChannelsRequestsStatuses, RequestStatusType} from 'mattermost-redux/types/requests';

import {handleRequest, initialRequestState} from './helpers';

function myChannels(state: RequestStatusType = initialRequestState(), action: GenericAction): RequestStatusType {
    return handleRequest(
        ChannelTypes.CHANNELS_REQUEST,
        ChannelTypes.CHANNELS_SUCCESS,
        ChannelTypes.CHANNELS_FAILURE,
        state,
        action,
    );
}

function createChannel(state: RequestStatusType = initialRequestState(), action: GenericAction): RequestStatusType {
    return handleRequest(
        ChannelTypes.CREATE_CHANNEL_REQUEST,
        ChannelTypes.CREATE_CHANNEL_SUCCESS,
        ChannelTypes.CREATE_CHANNEL_FAILURE,
        state,
        action,
    );
}

function updateChannel(state: RequestStatusType = initialRequestState(), action: GenericAction): RequestStatusType {
    return handleRequest(
        ChannelTypes.UPDATE_CHANNEL_REQUEST,
        ChannelTypes.UPDATE_CHANNEL_SUCCESS,
        ChannelTypes.UPDATE_CHANNEL_FAILURE,
        state,
        action,
    );
}

function getChannels(state: RequestStatusType = initialRequestState(), action: GenericAction): RequestStatusType {
    return handleRequest(
        ChannelTypes.GET_CHANNELS_REQUEST,
        ChannelTypes.GET_CHANNELS_SUCCESS,
        ChannelTypes.GET_CHANNELS_FAILURE,
        state,
        action,
    );
}

function getAllChannels(state: RequestStatusType = initialRequestState(), action: GenericAction): RequestStatusType {
    return handleRequest(
        ChannelTypes.GET_ALL_CHANNELS_REQUEST,
        ChannelTypes.GET_ALL_CHANNELS_SUCCESS,
        ChannelTypes.GET_ALL_CHANNELS_FAILURE,
        state,
        action,
    );
}

export default (combineReducers({
    getChannels,
    getAllChannels,
    myChannels,
    createChannel,
    updateChannel,
}) as (b: ChannelsRequestsStatuses, a: GenericAction) => ChannelsRequestsStatuses);
