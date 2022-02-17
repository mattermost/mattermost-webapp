// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {createSelector} from 'reselect';

import {getMyChannelMemberships, getAllChannels} from 'mattermost-redux/selectors/entities/channels';
import {getCurrentUserId, getUserStatuses} from 'mattermost-redux/selectors/entities/users';

import {GlobalState} from 'mattermost-redux/types/store';
import {Channel} from 'mattermost-redux/types/channels';
import {UserProfile, UserProfileWithLastViewAt} from 'mattermost-redux/types/users';
import {getDirectChannelName} from 'mattermost-redux/utils/channel_utils';
import {General} from 'mattermost-redux/constants';

export function makeAddLastViewAtToProfiles(): (state: GlobalState, profiles: UserProfile[]) => UserProfileWithLastViewAt[] {
    return createSelector(
        'makeAddLastViewAtToProfiles',
        getCurrentUserId,
        getMyChannelMemberships,
        getAllChannels,
        getUserStatuses,
        (_: GlobalState, profiles: UserProfile[]) => profiles,
        (currentUserId, memberships, allChannels, userStatuses, profiles) => {
            const DMchannels = Object.values(allChannels).reduce((acc: Record<string, Channel>, channel) => {
                if (channel.type === General.DM_CHANNEL) {
                    return {
                        ...acc,
                        [channel.name]: channel,
                    };
                }
                return acc;
            }, {});

            const formattedProfiles: UserProfileWithLastViewAt[] = profiles.map((profile) => {
                const channelName = getDirectChannelName(currentUserId, profile.id);
                const channel = DMchannels[channelName];
                const membership = channel ? memberships[channel.id] : null;
                const status = userStatuses[profile.id];

                return {
                    ...profile,
                    status,
                    last_viewed_at: channel && membership ? membership.last_viewed_at : 0,
                };
            });

            return formattedProfiles;
        },
    );
}
