// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';
import {Client4} from 'mattermost-redux/client';
import {Preferences} from 'mattermost-redux/constants';
import {getChannelsInCurrentTeam, getGroupChannels, getMyChannelMemberships} from 'mattermost-redux/selectors/entities/channels';
import {getBool} from 'mattermost-redux/selectors/entities/preferences';
import {getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';
import {getCurrentUserId, searchProfiles, getUserIdsInChannels, getUser} from 'mattermost-redux/selectors/entities/users';

import GlobeIcon from 'components/svg/globe_icon';
import LockIcon from 'components/svg/lock_icon';
import AppDispatcher from 'dispatcher/app_dispatcher.jsx';
import store from 'stores/redux_store.jsx';
import {getChannelDisplayName, sortChannelsByDisplayName} from 'utils/channel_utils.jsx';
import {ActionTypes, Constants} from 'utils/constants.jsx';
import * as Utils from 'utils/utils.jsx';

import Provider from './provider.jsx';
import Suggestion from './suggestion.jsx';

const getState = store.getState;

class SwitchChannelSuggestion extends Suggestion {
    render() {
        const {item, isSelection} = this.props;
        const channel = item.channel;

        let className = 'mentions__name';
        if (isSelection) {
            className += ' suggestion--selected';
        }

        let displayName = channel.display_name;
        let icon = null;
        if (channel.type === Constants.OPEN_CHANNEL) {
            icon = (
                <GlobeIcon className='icon icon__globe icon--body'/>
            );
        } else if (channel.type === Constants.PRIVATE_CHANNEL) {
            icon = (
                <LockIcon className='icon icon__lock icon--body'/>
            );
        } else if (channel.type === Constants.GM_CHANNEL) {
            displayName = getChannelDisplayName(channel);
            icon = <div className='status status--group'>{'G'}</div>;
        } else {
            icon = (
                <div className='pull-left'>
                    <img
                        className='mention__image'
                        src={Utils.imageURLForUser(channel)}
                    />
                </div>
            );
        }

        return (
            <div
                onClick={this.handleClick}
                className={className}
            >
                {icon}
                {displayName}
            </div>
        );
    }
}

let prefix = '';

function quickSwitchSorter(wrappedA, wrappedB) {
    if (wrappedA.type === Constants.MENTION_CHANNELS && wrappedB.type === Constants.MENTION_MORE_CHANNELS) {
        return -1;
    } else if (wrappedB.type === Constants.MENTION_CHANNELS && wrappedA.type === Constants.MENTION_MORE_CHANNELS) {
        return 1;
    }

    if (wrappedA.deactivated && !wrappedB.deactivated) {
        return 1;
    } else if (wrappedB.deactivated && !wrappedA.deactivated) {
        return -1;
    }

    const a = wrappedA.channel;
    const b = wrappedB.channel;

    let aDisplayName = getChannelDisplayName(a).toLowerCase();
    let bDisplayName = getChannelDisplayName(b).toLowerCase();

    if (a.type === Constants.DM_CHANNEL) {
        aDisplayName = aDisplayName.substring(1);
    }

    if (b.type === Constants.DM_CHANNEL) {
        bDisplayName = bDisplayName.substring(1);
    }

    const aStartsWith = aDisplayName.startsWith(prefix);
    const bStartsWith = bDisplayName.startsWith(prefix);
    if (aStartsWith && bStartsWith) {
        return sortChannelsByDisplayName(a, b);
    } else if (!aStartsWith && !bStartsWith) {
        return sortChannelsByDisplayName(a, b);
    } else if (aStartsWith) {
        return -1;
    }

    return 1;
}

function makeChannelSearchFilter(channelPrefix) {
    const channelPrefixLower = channelPrefix.toLowerCase();
    const curState = getState();
    const usersInChannels = getUserIdsInChannels(curState);
    const userSearchStrings = {};

    return (channel) => {
        let searchString = channel.display_name;

        if (channel.type === Constants.GM_CHANNEL || channel.type === Constants.DM_CHANNEL) {
            const usersInChannel = usersInChannels[channel.id] || [];
            for (const userId of usersInChannel) {
                let userString = userSearchStrings[userId];

                if (!userString) {
                    const user = getUser(curState, userId);
                    if (!user) {
                        continue;
                    }
                    const {nickname, username} = user;
                    userString = `${nickname}${username}${Utils.getFullName(user)}`;
                    userSearchStrings[userId] = userString;
                }
                searchString += userString;
            }
        }

        return searchString.toLowerCase().includes(channelPrefixLower);
    };
}

export default class SwitchChannelProvider extends Provider {
    handlePretextChanged(suggestionId, channelPrefix) {
        if (channelPrefix) {
            prefix = channelPrefix;
            this.startNewRequest(suggestionId, channelPrefix);

            // Dispatch suggestions for local data
            const channels = getChannelsInCurrentTeam(getState()).concat(getGroupChannels(getState()));
            const users = Object.assign([], searchProfiles(getState(), channelPrefix, true));
            this.formatChannelsAndDispatch(channelPrefix, suggestionId, channels, users, true);

            // Fetch data from the server and dispatch
            this.fetchUsersAndChannels(channelPrefix, suggestionId);

            return true;
        }

        return false;
    }

    async fetchUsersAndChannels(channelPrefix, suggestionId) {
        const teamId = getCurrentTeamId(getState());
        if (!teamId) {
            return;
        }

        let usersAsync;
        if (global.window.mm_config.RestrictDirectMessage === 'team') {
            usersAsync = Client4.autocompleteUsers(channelPrefix, teamId, '');
        } else {
            usersAsync = Client4.autocompleteUsers(channelPrefix, '', '');
        }

        const channelsAsync = Client4.searchChannels(teamId, channelPrefix);

        let usersFromServer = [];
        let channelsFromServer = [];
        try {
            usersFromServer = await usersAsync;
            channelsFromServer = await channelsAsync;
        } catch (err) {
            AppDispatcher.handleServerAction({
                type: ActionTypes.RECEIVED_ERROR,
                err,
            });
        }

        if (this.shouldCancelDispatch(channelPrefix)) {
            return;
        }

        const users = Object.assign([], searchProfiles(getState(), channelPrefix, true)).concat(usersFromServer.users);
        const channels = getChannelsInCurrentTeam(getState()).concat(getGroupChannels(getState())).concat(channelsFromServer);
        this.formatChannelsAndDispatch(channelPrefix, suggestionId, channels, users);
    }

    formatChannelsAndDispatch(channelPrefix, suggestionId, allChannels, users, skipNotInChannel = false) {
        const channels = [];

        const members = getMyChannelMemberships(getState());

        if (this.shouldCancelDispatch(channelPrefix)) {
            return;
        }

        const currentId = getCurrentUserId(getState());

        const completedChannels = {};

        const channelFilter = makeChannelSearchFilter(channelPrefix);

        for (const id of Object.keys(allChannels)) {
            const channel = allChannels[id];

            if (completedChannels[channel.id]) {
                continue;
            }

            if (channelFilter(channel)) {
                const newChannel = Object.assign({}, channel);
                const wrappedChannel = {channel: newChannel, name: newChannel.name, deactivated: false};
                if (newChannel.type === Constants.GM_CHANNEL) {
                    newChannel.name = getChannelDisplayName(newChannel);
                    wrappedChannel.name = newChannel.name;
                    const isGMVisible = getBool(getState(), Preferences.CATEGORY_GROUP_CHANNEL_SHOW, newChannel.id, false);
                    if (isGMVisible) {
                        wrappedChannel.type = Constants.MENTION_CHANNELS;
                    } else {
                        wrappedChannel.type = Constants.MENTION_MORE_CHANNELS;
                        if (skipNotInChannel) {
                            continue;
                        }
                    }
                } else if (members[channel.id]) {
                    wrappedChannel.type = Constants.MENTION_CHANNELS;
                } else {
                    wrappedChannel.type = Constants.MENTION_MORE_CHANNELS;
                    if (skipNotInChannel || !newChannel.display_name.toLowerCase().startsWith(channelPrefix)) {
                        continue;
                    }
                }

                completedChannels[channel.id] = true;
                channels.push(wrappedChannel);
            }
        }

        for (let i = 0; i < users.length; i++) {
            const user = users[i];

            if (completedChannels[user.id]) {
                continue;
            }

            const isDMVisible = getBool(getState(), Preferences.CATEGORY_DIRECT_CHANNEL_SHOW, user.id, false);
            let displayName = `@${user.username}`;

            if (user.id === currentId) {
                continue;
            }

            if ((user.first_name || user.last_name) && user.nickname) {
                displayName += ` - ${Utils.getFullName(user)} (${user.nickname})`;
            } else if (user.nickname) {
                displayName += ` - (${user.nickname})`;
            } else if (user.first_name || user.last_name) {
                displayName += ` - ${Utils.getFullName(user)}`;
            }

            if (user.delete_at) {
                displayName += ' - ' + Utils.localizeMessage('channel_switch_modal.deactivated', 'Deactivated');
            }

            const wrappedChannel = {
                channel: {
                    display_name: displayName,
                    name: user.username,
                    id: user.id,
                    update_at: user.update_at,
                    type: Constants.DM_CHANNEL,
                    last_picture_update: user.last_picture_update || 0,
                },
                name: user.username,
                deactivated: user.delete_at,
            };

            if (isDMVisible) {
                wrappedChannel.type = Constants.MENTION_CHANNELS;
            } else {
                wrappedChannel.type = Constants.MENTION_MORE_CHANNELS;
                if (skipNotInChannel) {
                    continue;
                }
            }

            completedChannels[user.id] = true;
            channels.push(wrappedChannel);
        }

        const channelNames = channels.
            sort(quickSwitchSorter).
            map((wrappedChannel) => wrappedChannel.channel.name);

        if (skipNotInChannel) {
            channels.push({
                type: Constants.MENTION_MORE_CHANNELS,
                loading: true,
            });
        }

        setTimeout(() => {
            AppDispatcher.handleServerAction({
                type: ActionTypes.SUGGESTION_RECEIVED_SUGGESTIONS,
                id: suggestionId,
                matchedPretext: channelPrefix,
                terms: channelNames,
                items: channels,
                component: SwitchChannelSuggestion,
            });
        }, 0);
    }
}
