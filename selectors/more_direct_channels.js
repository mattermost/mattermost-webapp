// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {createSelector} from 'reselect';
import {getCurrentUserId, makeGetProfilesInChannel} from 'mattermost-redux/selectors/entities/users';
import {getGroupChannels} from 'mattermost-redux/selectors/entities/channels';

const doGetProfilesInChannel = makeGetProfilesInChannel();
const getOtherProfilesInChannel = (state) => {
    return (channelId, currentUserId) => {
        return doGetProfilesInChannel(state, channelId).filter((profile) => profile.id !== currentUserId);
    };
};

export const getChannelsWithUserProfiles = createSelector(
    getOtherProfilesInChannel,
    getGroupChannels,
    getCurrentUserId,
    (getProfiles, channels, currentUserId) => {
        return channels.map((channel) => {
            const profiles = getProfiles(channel.id, currentUserId);
            return Object.assign({}, channel, {profiles});
        });
    }
);

export const matchExistsInChannelProfiles = (profiles, searchTerm) => {
    const searchTermLower = searchTerm.toLowerCase();

    return profiles.filter((profile) =>
        profile.first_name.toLowerCase().indexOf(searchTermLower) !== -1 ||
        profile.last_name.toLowerCase().indexOf(searchTermLower) !== -1 ||
        profile.username.toLowerCase().indexOf(searchTermLower) !== -1 ||
        profile.nickname.toLowerCase().indexOf(searchTermLower) !== -1
    ).length > 0;
};
