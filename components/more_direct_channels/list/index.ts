// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {getAllChannels, getChannelsWithUserProfiles} from 'mattermost-redux/selectors/entities/channels';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';

import {UserProfile} from 'mattermost-redux/types/users';

import {getUserIdFromChannelName} from 'mattermost-redux/utils/channel_utils';
import {filterProfilesStartingWithTerm} from 'mattermost-redux/utils/user_utils';

import {GlobalState} from 'types/store';

import Constants from 'utils/constants';

import {OptionValue} from '../types';

import List from './list';

type OwnProps = {
    users: UserProfile[];
    values: OptionValue[];
}

/*
Ideal:
1. Recent DMs/GMs matching filter
    => DMs = DMs with user in users and user is active
    => GMs = GMs with user in users
2. Other users alphabetically matching filter

*/

function makeGetOptions() {
    return (state: GlobalState, users: UserProfile[], values: OptionValue[]) => {
        const currentUserId = getCurrentUserId(state);
        const searchTerm = state.views.search.modalSearch;

        const allChannels = getAllChannels(state);
        const directChannels = Object.values(allChannels).filter((channel) => channel.type === Constants.DM_CHANNEL);

        // Gets all loaded DMs (as UserProfiles)
        const usersWithDMs: Array<UserProfile & {last_post_at: number}> = [];
        for (const channel of directChannels) {
            const otherUserId = getUserIdFromChannelName(currentUserId, channel.name);
            const otherUser = users.find((user) => user.id === otherUserId);

            if (!otherUser) {
                // The user doesn't match the search filter
                continue;
            }

            if (channel.last_post_at === 0) {
                // The DM channel exists but has no messages in it
                continue;
            }

            usersWithDMs.push({
                ...otherUser,
                last_post_at: channel.last_post_at,
            });
        }

        const filteredGroupChannels = getChannelsWithUserProfiles(state).filter((channel) => {
            if (searchTerm) {
                // Check that at least one of the users in the channel matches the search term
                const matches = filterProfilesStartingWithTerm(channel.profiles, searchTerm);
                if (matches.length === 0) {
                    return false;
                }
            }

            if (values) {
                // Check that all of the selected users are in the channel
                const valuesInProfiles = values.every((value) => channel.profiles.find((user) => user.id === value.id));
                if (!valuesInProfiles) {
                    return false;
                }
            }

            // Only include GM channels with messages in them
            return channel.last_post_at > 0;
        });

        // Recent DMs (as UserProfiles) and GMs sorted by recent activity
        const recents = [...usersWithDMs, ...filteredGroupChannels].
            sort((a, b) => b.last_post_at - a.last_post_at);

        // Other users sorted by whether or not they've been deactivated followed by alphabetically
        const usersWithoutDMs = users.
            filter((user) => !usersWithDMs.some((other) => other.id === user.id)).
            map((user) => ({...user, last_post_at: 0}));
        usersWithoutDMs.sort((a, b) => {
            if (a.delete_at > 0 && b.delete_at === 0) {
                return -1;
            } else if (a.delete_at === 0 && b.delete_at > 0) {
                return 1;
            }

            return a.username.localeCompare(b.username);
        });

        return [
            ...recents, // TODO this isn't limited to 20 and that's probably fine
            ...usersWithoutDMs,
        ];

        // users = [...users].sort(sortByUsername);

        // const filteredGroupChannels = filterGroupChannels(getChannelsWithUserProfiles(state), searchTerm);
        // const myDirectChannels = filterDirectChannels(getAllChannels(state), currentUserId);

        // // dmUsers is the list of every user we have a DM with that has posts in it
        // let dmUsers: UserProfile[] = myDirectChannels.reduce((results, channel) => {
        //     if (!channel.last_post_at) {
        //         return results;
        //     }

        //     const user = getUser(state, getUserIdFromChannelName(currentUserId, channel.name));

        //     if (user) {
        //         results!.push({...user, last_post_at: channel.last_post_at});
        //     }

        //     return results;
        // }, []);

        // // That is filtered by the users fitting our searchTerms
        // if (searchTerm) {
        //     dmUsers = intersectionBy(dmUsers, users, 'id');
        // }

        // // Sort active users before inactive users
        // const [activeUsers, inactiveUsers] = partition(users, ({delete_at: deleteAt}) => deleteAt === 0);
        // users = activeUsers.concat(inactiveUsers);

        // // After this, users will only contain undeleted users and users with DMs that are not in dmUsers
        // users = users.filter((user) => (
        //     (user.delete_at === 0 || myDirectChannels.some(({name}) => name.includes(user.id))) &&
        //     !dmUsers.some(({id}) => id === user.id)
        // ));

        // // Get group channels where the user has selected a subset of the channel's members already
        // const groupChannelsWithAvailableProfiles = filteredGroupChannels.filter(({profiles}) => differenceBy(profiles, values, 'id').length);

        // // Separate out those group channels by whether or not those channels contain posts
        // const [recentGroupChannels, groupChannels] = partition(groupChannelsWithAvailableProfiles, 'last_post_at');

        // const recent = [
        //     ...dmUsers,
        //     ...recentGroupChannels,
        // ].sort((a, b) => b.last_post_at - a.last_post_at);

        // /*
        // 1. recent (limited up to 20 without search term)?
        //     sorted by last_post_at
        //     - dmUsers

        // 2. users
        // 3. groupChannels
        //     group channels with members that are a subset of selected and have no last_post_at

        // */

        // if (recent.length && !searchTerm) {
        //     return recent.slice(0, 20);
        // }

        // // TODO filter out users and the user's self-DM channel in the component

        // return [
        //     ...recent,
        //     ...users,
        //     ...groupChannels,
        // ];
    };
}

function makeMapStateToProps() {
    const getOptions = makeGetOptions();

    return (state: GlobalState, ownProps: OwnProps) => {
        return {
            options: getOptions(state, ownProps.users, ownProps.values),
        };
    };
}

export default connect(makeMapStateToProps)(List);
