// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {createSelector} from 'reselect';

import {getMyChannelMemberships, getAllChannels} from '../../selectors/entities/channels';
import {getCurrentUserId} from '../../selectors/entities/users';

import {GlobalState} from '../../types/store';
import {Channel} from '../../types/channels';
import {UserProfile, UserProfileWithLastViewAt} from '../../types/users';
import {getDirectChannelName} from '../../utils/channel_utils';
import {General} from '../../constants';

import {NameMappedObjects} from '../../types/utilities';

export function makeAddLastViewAtToProfiles(): (state: GlobalState, profiles: UserProfile[]) => Array<UserProfileWithLastViewAt> {
    return createSelector(
        getCurrentUserId,
        getMyChannelMemberships,
        getAllChannels,
        (state: GlobalState, profiles: UserProfile[]) => profiles,
        (currentUserId, memberships, allChannels, profiles) => {
            const DMchannels = Object.values(allChannels).reduce((acc: NameMappedObjects<Channel>, channel) => {
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
                return {
                    ...profile,
                    last_viewed_at: channel && membership ? membership.last_viewed_at : 0,
                };
            });
            return formattedProfiles;
        },
    );
}
