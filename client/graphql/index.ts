// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Client4} from 'mattermost-redux/client';
import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {DispatchFunc, GetStateFunc} from 'mattermost-redux/types/actions';

import {meQuery} from './queries/me';

export function loadMeGQL() {
    return async (dispatch: DispatchFunc, getState: GetStateFunc) => {
        const state = getState();
        const config = getConfig(state);

        // TODO
        // const deviceId = state.entities.general.deviceToken;
        // if (deviceId) {
        //     Client4.attachDevice(deviceId);
        // }

        const baseUrl = `${Client4.getUrl()}/api/v5/graphql`;

        try {
            const response = await Client4.doFetchWithResponse(baseUrl, {
                method: 'post',
                body: JSON.stringify({query: meQuery}),
            });

            console.log('data', response.data.data);
        } catch (error) {
            console.log('error', error);
        }

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
