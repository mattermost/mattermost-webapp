// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {UserTypes} from 'mattermost-redux/action_types';
import {Client4} from 'mattermost-redux/client';
import {Preferences} from 'mattermost-redux/constants';
import {
    getChannelsInCurrentTeam,
    getDirectChannels,
    getSortedUnreadChannelIds,
    makeGetChannel,
} from 'mattermost-redux/selectors/entities/channels';
import {getMyChannelMemberships} from 'mattermost-redux/selectors/entities/common';
import {getBool} from 'mattermost-redux/selectors/entities/preferences';
import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';
import {
    getCurrentUserId,
    getUserIdsInChannels,
    getUser,
    searchProfiles,
} from 'mattermost-redux/selectors/entities/users';
import * as ChannelActions from 'mattermost-redux/actions/channels';

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
    static get propTypes() {
        return {
            ...super.propTypes,
            channelMember: PropTypes.object,
        };
    }

    render() {
        const {item, isSelection} = this.props;
        const channel = item.channel;

        const member = this.props.channelMember;
        let badge = null;
        if (member) {
            if (member.notify_props && member.mention_count > 0) {
                badge = <span className='badge'>{member.mention_count}</span>;
            }
        }

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
                        src={Utils.imageURLForUser(channel.userId)}
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
                {badge}
            </div>
        );
    }
}

function mapStateToPropsForSwitchChannelSuggestion(state, ownProps) {
    const channelId = ownProps.item && ownProps.item.channel ? ownProps.item.channel.id : '';
    return {
        channelMember: getMyChannelMemberships(state)[channelId],
    };
}

const ConnectedSwitchChannelSuggestion = connect(mapStateToPropsForSwitchChannelSuggestion)(SwitchChannelSuggestion);

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
            const usersInChannel = usersInChannels[channel.id] || new Set([]);

            // In case the channel is a DM and the profilesInChannel is not populated
            if (!usersInChannel.length && channel.type === Constants.DM_CHANNEL) {
                const userId = Utils.getUserIdFromChannelId(channel.name);
                const user = getUser(curState, userId);
                if (user) {
                    usersInChannel.add(userId);
                }
            }

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
            const channels = getChannelsInCurrentTeam(getState()).concat(getDirectChannels(getState()));
            const users = Object.assign([], searchProfiles(getState(), channelPrefix, false));
            this.formatChannelsAndDispatch(channelPrefix, suggestionId, channels, users, true);

            // Fetch data from the server and dispatch
            this.fetchUsersAndChannels(channelPrefix, suggestionId);
        } else {
            this.formatUnreadChannelsAndDispatch(suggestionId);
        }

        return true;
    }

    async fetchUsersAndChannels(channelPrefix, suggestionId) {
        const state = getState();
        const teamId = getCurrentTeamId(state);
        if (!teamId) {
            return;
        }

        const config = getConfig(state);
        let usersAsync;
        if (config.RestrictDirectMessage === 'team') {
            usersAsync = Client4.autocompleteUsers(channelPrefix, teamId, '');
        } else {
            usersAsync = Client4.autocompleteUsers(channelPrefix, '', '');
        }

        let usersFromServer = [];
        let channelsFromServer = [];
        try {
            usersFromServer = await usersAsync;
            const {data} = await ChannelActions.searchChannels(teamId, channelPrefix)(store.dispatch, store.getState);
            channelsFromServer = data;
        } catch (err) {
            AppDispatcher.handleServerAction({
                type: ActionTypes.RECEIVED_ERROR,
                err,
            });
        }

        if (this.shouldCancelDispatch(channelPrefix)) {
            return;
        }

        const users = Object.assign([], searchProfiles(state, channelPrefix, false)).concat(usersFromServer.users);
        const currentUserId = getCurrentUserId(state);
        store.dispatch({
            type: UserTypes.RECEIVED_PROFILES_LIST,
            data: users.filter((user) => user.id !== currentUserId),
        });
        const channels = getChannelsInCurrentTeam(state).concat(getDirectChannels(state)).concat(channelsFromServer);
        this.formatChannelsAndDispatch(channelPrefix, suggestionId, channels, users);
    }

    userWrappedChannel(user, channel) {
        let displayName = `@${user.username}`;

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

        return {
            channel: {
                display_name: displayName,
                name: user.username,
                id: channel ? channel.id : user.id,
                userId: user.id,
                update_at: user.update_at,
                type: Constants.DM_CHANNEL,
                last_picture_update: user.last_picture_update || 0,
            },
            name: user.username,
            deactivated: user.delete_at,
        };
    }

    formatChannelsAndDispatch(channelPrefix, suggestionId, allChannels, users, skipNotInChannel = false) {
        const channels = [];

        const members = getMyChannelMemberships(getState());

        if (this.shouldCancelDispatch(channelPrefix)) {
            return;
        }

        const completedChannels = {};

        const channelFilter = makeChannelSearchFilter(channelPrefix);

        for (const id of Object.keys(allChannels)) {
            const channel = allChannels[id];

            if (completedChannels[channel.id]) {
                continue;
            }

            if (channelFilter(channel)) {
                const newChannel = Object.assign({}, channel);

                let wrappedChannel = {channel: newChannel, name: newChannel.name, deactivated: false};
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
                } else if (newChannel.type === Constants.DM_CHANNEL) {
                    const userId = Utils.getUserIdFromChannelId(newChannel.name);
                    const user = users.find((u) => u.id === userId);

                    if (user) {
                        completedChannels[user.id] = true;
                        wrappedChannel = this.userWrappedChannel(
                            user,
                            newChannel
                        );
                        const isDMVisible = getBool(getState(), Preferences.CATEGORY_DIRECT_CHANNEL_SHOW, user.id, false);
                        if (isDMVisible) {
                            wrappedChannel.type = Constants.MENTION_CHANNELS;
                        } else {
                            wrappedChannel.type = Constants.MENTION_MORE_CHANNELS;
                            if (skipNotInChannel) {
                                continue;
                            }
                        }
                    } else {
                        continue;
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

            const wrappedChannel = this.userWrappedChannel(user);

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
                component: ConnectedSwitchChannelSuggestion,
            });
        }, 0);
    }

    formatUnreadChannelsAndDispatch(suggestionId) {
        const getChannel = makeGetChannel();

        const unreadChannelIds = getSortedUnreadChannelIds(getState(), false);

        const channels = [];
        for (let i = 0; i < unreadChannelIds.length; i++) {
            const channel = getChannel(getState(), {id: unreadChannelIds[i]}) || {};

            let wrappedChannel = {channel, name: channel.name, deactivated: false};
            if (channel.type === Constants.GM_CHANNEL) {
                wrappedChannel.name = getChannelDisplayName(channel);
            } else if (channel.type === Constants.DM_CHANNEL) {
                wrappedChannel = this.userWrappedChannel(
                    getUser(getState(), Utils.getUserIdFromChannelId(channel.name)),
                    channel
                );
            }
            wrappedChannel.type = Constants.MENTION_UNREAD_CHANNELS;
            channels.push(wrappedChannel);
        }

        const channelNames = channels.map((wrappedChannel) => wrappedChannel.channel.name);

        setTimeout(() => {
            AppDispatcher.handleServerAction({
                type: ActionTypes.SUGGESTION_RECEIVED_SUGGESTIONS,
                id: suggestionId,
                matchedPretext: '',
                terms: channelNames,
                items: channels,
                component: ConnectedSwitchChannelSuggestion,
            });
        }, 0);
    }
}
