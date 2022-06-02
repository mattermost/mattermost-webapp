// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {InsightTypes} from 'mattermost-redux/action_types';
import {GetStateFunc, DispatchFunc, ActionFunc} from 'mattermost-redux/types/actions';
import {Client4} from 'mattermost-redux/client';
import {TimeFrame, TopChannelActionResult, TopChannelResponse} from '@mattermost/types/insights';

import {forceLogoutIfNecessary} from './helpers';
import {logError} from './errors';

export function getTopReactionsForTeam(teamId: string, page: number, perPage: number, timeFrame: TimeFrame): ActionFunc {
    return async (dispatch: DispatchFunc, getState: GetStateFunc) => {
        let data;
        try {
            data = await Client4.getTopReactionsForTeam(teamId, page, perPage, timeFrame);
        } catch (error) {
            forceLogoutIfNecessary(error, dispatch, getState);
            dispatch(logError(error));
            return {error};
        }

        dispatch({
            type: InsightTypes.RECEIVED_TOP_REACTIONS,
            data: {data, timeFrame},
            id: teamId,
        });

        return {data};
    };
}

export function getMyTopReactions(teamId: string, page: number, perPage: number, timeFrame: TimeFrame): ActionFunc {
    return async (dispatch: DispatchFunc, getState: GetStateFunc) => {
        let data;
        try {
            data = await Client4.getMyTopReactions(teamId, page, perPage, timeFrame);
        } catch (error) {
            forceLogoutIfNecessary(error, dispatch, getState);
            dispatch(logError(error));
            return {error};
        }

        dispatch({
            type: InsightTypes.RECEIVED_MY_TOP_REACTIONS,
            data: {data, timeFrame},
            id: teamId,
        });

        return {data};
    };
}

export function getTopChannelsForTeam(teamId: string, page: number, perPage: number, timeFrame: TimeFrame): (dispatch: DispatchFunc, getState: GetStateFunc) => Promise<TopChannelActionResult> | TopChannelActionResult {
    return async (dispatch: DispatchFunc, getState: GetStateFunc) => {
        let data: TopChannelResponse;
        try {
            data = await Client4.getTopChannelsForTeam(teamId, page, perPage, timeFrame);
        } catch (error) {
            forceLogoutIfNecessary(error, dispatch, getState);
            dispatch(logError(error));
            return {error};
        }

        return {data};
    };
}

export function getMyTopChannels(teamId: string, page: number, perPage: number, timeFrame: TimeFrame): (dispatch: DispatchFunc, getState: GetStateFunc) => Promise<TopChannelActionResult> | TopChannelActionResult {
    return async (dispatch: DispatchFunc, getState: GetStateFunc) => {
        let data: TopChannelResponse;
        try {
            data = await Client4.getMyTopChannels(teamId, page, perPage, timeFrame);
        } catch (error) {
            forceLogoutIfNecessary(error, dispatch, getState);
            dispatch(logError(error));
            return {error};
        }

        return {data};
    };
}
