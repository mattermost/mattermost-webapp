// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Client4} from 'mattermost-redux/client';

import {ActionFunc, DispatchFunc, GetStateFunc} from 'mattermost-redux/types/actions';
import {getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';

import {Board, BoardPatch, BoardTemplate} from '@mattermost/types/boards';
import {PreferenceType} from '@mattermost/types/preferences';

import {Preferences} from '../constants';

import {logError} from './errors';
import {savePreferences} from './preferences';

export function createBoardFromTemplate(templateId: string): ActionFunc {
    return async (dispatch: DispatchFunc, getState: GetStateFunc) => {
        const state = getState();
        const teamId = getCurrentTeamId(state);

        try {
            const {boards} = await Client4.createBoardFromTemplate(templateId, teamId);
            return {data: boards[0]};
        } catch (error) {
            dispatch(logError(error));
            return {error};
        }
    };
}

export function getBoardsTemplates(): ActionFunc {
    return async (dispatch: DispatchFunc, getState: GetStateFunc) => {
        const state = getState();
        const teamId = getCurrentTeamId(state);
        try {
            let templates: BoardTemplate[] = [];

            // first go and fetch the based stablished templates
            const baseTemplates = await Client4.getBoardsTemplates();
            if (baseTemplates) {
                templates = [...baseTemplates];
            }

            // then grab the team templates and return all together
            const teamTemplates = await Client4.getBoardsTemplates(teamId);
            if (teamTemplates) {
                templates = [...templates, ...teamTemplates];
            }
            return {data: templates};
        } catch (error) {
            dispatch(logError(error));
            return {error};
        }
    };
}

export function createEmptyBoard(board: Board): ActionFunc {
    return async (dispatch: DispatchFunc) => {
        try {
            const newBoard = await Client4.createBoard(board);
            return {data: newBoard};
        } catch (error) {
            dispatch(logError(error));
            return {error};
        }
    };
}

export function attachBoardToChannel(newBoardId: string, boardPatch: BoardPatch): ActionFunc {
    return async (dispatch: DispatchFunc) => {
        try {
            const patchedBoard = await Client4.patchBoard(newBoardId, boardPatch);
            return {data: patchedBoard};
        } catch (error) {
            dispatch(logError(error));
            return {error};
        }
    };
}

export function setNewChannelWithBoardPreference(initializationState: Record<string, boolean>): ActionFunc {
    return async (dispatch: DispatchFunc, getState: GetStateFunc) => {
        const state = getState();
        const currentUserId = getCurrentUserId(state);
        const preference: PreferenceType = {
            user_id: currentUserId,
            category: Preferences.APP_BAR,
            name: Preferences.NEW_CHANNEL_WITH_BOARD_TOUR_SHOWED,
            value: JSON.stringify(initializationState),
        };
        await dispatch(savePreferences(currentUserId, [preference]));
        return {data: true};
    };
}
