// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Team} from '@mattermost/types/teams';
import {ServerError} from '@mattermost/types/errors';

import {ActionFunc} from 'mattermost-redux/types/actions';
import {ChannelTypes} from 'mattermost-redux/action_types';
import {getTeamByName, selectTeam} from 'mattermost-redux/actions/teams';
import {forceLogoutIfNecessary} from 'mattermost-redux/actions/helpers';
import {fetchMyChannelsAndMembers} from 'mattermost-redux/actions/channels';
import {getGroups, getAllGroupsAssociatedToChannelsInTeam, getAllGroupsAssociatedToTeam, getGroupsByUserIdPaginated} from 'mattermost-redux/actions/groups';
import {logError} from 'mattermost-redux/actions/errors';
import {isCustomGroupsEnabled} from 'mattermost-redux/selectors/entities/preferences';
import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';
import {getLicense} from 'mattermost-redux/selectors/entities/general';
import {isGuest} from 'mattermost-redux/utils/user_utils';

import {isSuccess} from 'types/actions';

import {loadStatusesForChannelAndSidebar} from 'actions/status_actions';
import {addUserToTeam} from 'actions/team_actions';

import LocalStorageStore from 'stores/local_storage_store';

export function initializeTeam(team: Team): ActionFunc<Team, ServerError> {
    return async (dispatch, getState) => {
        const state = getState();

        dispatch({type: ChannelTypes.CHANNELS_MEMBERS_CATEGORIES_REQUEST, data: null});

        const currentUser = getCurrentUser(state);
        LocalStorageStore.setPreviousTeamId(currentUser.id, team.id);

        dispatch(selectTeam(team.id));

        if (isGuest(currentUser.roles)) {
            dispatch({type: ChannelTypes.CHANNELS_MEMBERS_CATEGORIES_FAILURE, error: null});
        }

        try {
            await dispatch(fetchMyChannelsAndMembers(team.id));
            dispatch({type: ChannelTypes.CHANNELS_MEMBERS_CATEGORIES_SUCCESS, data: null});
        } catch (error) {
            dispatch({type: ChannelTypes.CHANNELS_MEMBERS_CATEGORIES_FAILURE, error});
            forceLogoutIfNecessary(error as ServerError, dispatch, getState);
            dispatch(logError(error as ServerError));
            return {error: error as ServerError};
        }

        dispatch(loadStatusesForChannelAndSidebar());

        const license = getLicense(state);
        const customGroupEnabled = isCustomGroupsEnabled(state);

        if (license &&
            license.IsLicensed === 'true' &&
            (license.LDAPGroups === 'true' || customGroupEnabled)) {
            if (currentUser) {
                dispatch(getGroupsByUserIdPaginated(currentUser.id, false, 0, 60, true));
            }

            if (license.LDAPGroups === 'true') {
                dispatch(getAllGroupsAssociatedToChannelsInTeam(team.id, true));
            }

            if (team.group_constrained && license.LDAPGroups === 'true') {
                dispatch(getAllGroupsAssociatedToTeam(team.id, true));
            } else {
                dispatch(getGroups(false, 0, 60));
            }
        }

        return {data: team};
    };
}

export function joinTeam(teamname: string, joinedOnFirstLoad: boolean): ActionFunc<Team, ServerError> {
    return async (dispatch, getState) => {
        const state = getState();

        const currentUser = getCurrentUser(state);

        try {
            const teamByNameResult = await dispatch(getTeamByName(teamname));
            if (isSuccess(teamByNameResult)) {
                const team = teamByNameResult.data;

                if (currentUser && team && team.delete_at === 0) {
                    const addUserToTeamResult = await dispatch(addUserToTeam(team.id, currentUser.id));
                    if (isSuccess(addUserToTeamResult)) {
                        if (joinedOnFirstLoad) {
                            LocalStorageStore.setTeamIdJoinedOnLoad(team.id);
                        }
                        return dispatch(initializeTeam(team));
                    }
                    throw addUserToTeamResult.error;
                }
                throw new Error('Team not found or deleted');
            } else {
                throw teamByNameResult.error;
            }
        } catch (error) {
            forceLogoutIfNecessary(error as ServerError, dispatch, getState);
            dispatch(logError(error as ServerError));
            return {error: error as ServerError};
        }
    };
}
