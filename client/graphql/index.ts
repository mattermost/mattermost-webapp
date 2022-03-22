// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {batchActions} from 'redux-batched-actions';

import {Client4} from 'mattermost-redux/client';
import {Client4Error} from 'mattermost-redux/types/client4';
import {ServerError} from 'mattermost-redux/types/errors';
import {PreferenceTypes, UserTypes, TeamTypes, GeneralTypes} from 'mattermost-redux/action_types';
import {DispatchFunc, GetStateFunc} from 'mattermost-redux/types/actions';
import {setServerVersion} from 'mattermost-redux/actions/general';
import {getSubscriptionStats} from 'mattermost-redux/actions/cloud';
import {logError} from 'mattermost-redux/actions/errors';
import {forceLogoutIfNecessary} from 'mattermost-redux/actions/helpers';
import {getServerVersion} from 'mattermost-redux/selectors/entities/general';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/common';
import {getUser} from 'mattermost-redux/selectors/entities/users';

import {
    myDataQuery,
    MyDataQueryResponseType,
    transformToRecievedMeReducerPayload,
    transformToRecievedAllPreferencesReducerPayload,
    transformToRecievedTeamsListReducerPayload,
    transformToRecievedMyTeamMembersReducerPayload,
} from './queries/myData';

export function loadMeGQL() {
    return async (dispatch: DispatchFunc, getState: GetStateFunc) => {
        if (!document.cookie.includes('MMUSERID=')) {
            return {data: false};
        }

        const state = getState();

        const deviceId = state.entities.general.deviceToken;
        if (deviceId) {
            Client4.attachDevice(deviceId);
        }

        let responseData: MyDataQueryResponseType['data'] | null = null;
        try {
            const {data} = await Client4.doFetchWithGraphQL<MyDataQueryResponseType>(myDataQuery);
            responseData = data;

            // eslint-disable-next-line no-console
            console.log('graphql data', data);
        } catch (error) {
            forceLogoutIfNecessary(error as Client4Error, dispatch, getState);
            dispatch(logError(error as ServerError));
            return {data: false};
        }

        if (!responseData) {
            return {data: false};
        }

        dispatch(
            batchActions([
                {
                    type: GeneralTypes.CLIENT_LICENSE_RECEIVED,
                    data: responseData.license,
                },
                {
                    type: UserTypes.RECEIVED_ME,
                    data: transformToRecievedMeReducerPayload(responseData.user),
                },
                {
                    type: PreferenceTypes.RECEIVED_ALL_PREFERENCES,
                    data: transformToRecievedAllPreferencesReducerPayload(responseData.user),
                },
                {
                    type: TeamTypes.RECEIVED_TEAMS_LIST,
                    data: transformToRecievedTeamsListReducerPayload(responseData.teamMembers),
                },
                {
                    type: TeamTypes.RECEIVED_MY_TEAM_MEMBERS,
                    data: transformToRecievedMyTeamMembersReducerPayload(responseData.teamMembers),
                },
            ]),
        );

        const isLicensedForCloud = responseData.license.Cloud === 'true';
        if (isLicensedForCloud) {
            // When this is implemented in grapqhl server, we can add the query for that in above instead of here
            await dispatch(getSubscriptionStats());
        }

        // Sometimes the server version is set in one or the other
        const serverVersion = Client4.getServerVersion() || getServerVersion(state);
        dispatch(setServerVersion(serverVersion));

        const currentUserId = getCurrentUserId(state);
        if (currentUserId) {
            Client4.setUserId(currentUserId);
        }

        const user = getUser(state, currentUserId);
        if (user) {
            Client4.setUserRoles(user.roles);
        }

        return {data: true};
    };
}
