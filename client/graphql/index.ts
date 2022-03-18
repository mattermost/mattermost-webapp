// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {batchActions} from 'redux-batched-actions';

import {Client4} from 'mattermost-redux/client';
import {PreferenceTypes, UserTypes, TeamTypes} from 'mattermost-redux/action_types';
import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {DispatchFunc, GetStateFunc} from 'mattermost-redux/types/actions';

import {
    myDataQuery,
    MyDataResponseType,
    transformToRecievedMeReducerPayload,
    transformToRecievedAllPreferencesReducerPayload,
} from './queries/myData';

export function loadMeGQL() {
    return async (dispatch: DispatchFunc, getState: GetStateFunc) => {
        const state = getState();
        const config = getConfig(state);

        const deviceId = state.entities.general.deviceToken;
        if (deviceId) {
            Client4.attachDevice(deviceId);
        }

        let responseData: MyDataResponseType['data'] | null = null;
        try {
            const {data} =
                await Client4.doFetchWithGraphQL<MyDataResponseType>(
                    myDataQuery,
                );
            responseData = data;

            console.log('data', data);
        } catch (error) {
            // eslint-disable-next-line no-console
            console.log('error', error);
        }

        if (!responseData) {
            return;
        }

        dispatch(
            batchActions([
                {
                    type: UserTypes.RECEIVED_ME,
                    data: transformToRecievedMeReducerPayload(
                        responseData.user,
                    ),
                },
                {
                    type: PreferenceTypes.RECEIVED_ALL_PREFERENCES,
                    data: transformToRecievedAllPreferencesReducerPayload(
                        responseData.user,
                    ),
                },
                {
                    type: TeamTypes.RECEIVED_TEAMS_LIST,
                },
            ]),
        );

        // const promises = [
        //     dispatch(getMe()),
        //     dispatch(getMyPreferences()),
        //     dispatch(getMyTeams()),
        //     dispatch(getMyTeamMembers()),
        // ];

        // // Sometimes the server version is set in one or the other
        // const serverVersion = Client4.getServerVersion() || getState().entities.general.serverVersion;
        // dispatch(setServerVersion(serverVersion));
        // if (!isMinimumServerVersion(serverVersion, 4, 7) && config.EnableCustomEmoji === 'true') {
        //     dispatch(getAllCustomEmojis());
        // }

        // await Promise.all(promises);

        // const collapsedReplies = isCollapsedThreadsEnabled(getState());
        // dispatch(getMyTeamUnreads(collapsedReplies));

        // const {currentUserId} = getState().entities.users;
        // const user = getState().entities.users.profiles[currentUserId];
        // if (currentUserId) {
        //     Client4.setUserId(currentUserId);
        // }

        // if (user) {
        //     Client4.setUserRoles(user.roles);
        // }

        // return {data: true};
    };
}
