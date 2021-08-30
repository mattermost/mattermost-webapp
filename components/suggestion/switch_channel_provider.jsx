// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
/* eslint-disable max-lines */

import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';

import {UserTypes} from 'mattermost-redux/action_types';
import {Client4} from 'mattermost-redux/client';
import {
    getChannelsInCurrentTeam,
    getDirectAndGroupChannels,
    getGroupChannels,
    getMyChannelMemberships,
    getChannelByName,
    getCurrentChannel,
    getDirectTeammate,
} from 'mattermost-redux/selectors/entities/channels';

import ProfilePicture from '../profile_picture';

import {getMyPreferences, isGroupChannelManuallyVisible, isCollapsedThreadsEnabled} from 'mattermost-redux/selectors/entities/preferences';
import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';
import {
    getCurrentUserId,
    getUserIdsInChannels,
    getUser,
    makeSearchProfilesMatchingWithTerm,
    getStatusForUserId,
    getUserByUsername,
} from 'mattermost-redux/selectors/entities/users';
import {getChannels, searchChannels} from 'mattermost-redux/actions/channels';
import {logError} from 'mattermost-redux/actions/errors';
import {sortChannelsByTypeAndDisplayName} from 'mattermost-redux/utils/channel_utils';

import SharedChannelIndicator from 'components/shared_channel_indicator';
import BotBadge from 'components/widgets/badges/bot_badge';
import GuestBadge from 'components/widgets/badges/guest_badge';
import CustomStatusEmoji from 'components/custom_status/custom_status_emoji';

import {getPostDraft} from 'selectors/rhs';
import store from 'stores/redux_store.jsx';
import {Constants, StoragePrefixes} from 'utils/constants';
import * as Utils from 'utils/utils.jsx';

import {Preferences} from 'mattermost-redux/constants';
import {getPreferenceKey} from 'mattermost-redux/utils/preference_utils';

import Provider from './provider.jsx';
import Suggestion from './suggestion.jsx';

const getState = store.getState;
const searchProfilesMatchingWithTerm = makeSearchProfilesMatchingWithTerm();

class SwitchChannelSuggestion extends Suggestion {
    static get propTypes() {
        return {
            ...super.propTypes,
            channelMember: PropTypes.object,
            hasDraft: PropTypes.bool,
            userImageUrl: PropTypes.string,
            dmChannelTeammate: PropTypes.object,
            collapsedThreads: PropTypes.bool,
        };
    }

    render() {
        const {item, isSelection, userImageUrl, status, userItem, collapsedThreads} = this.props;
        const channel = item.channel;
        const channelIsArchived = channel.delete_at && channel.delete_at !== 0;

        const member = this.props.channelMember;
        const teammate = this.props.dmChannelTeammate;
        let badge = null;

        if (member && member.notify_props) {
            const unreadMentions = collapsedThreads ? member.mention_count_root : member.mention_count;
            if (unreadMentions > 0) {
                badge = <span className='badge'>{unreadMentions}</span>;
            }
        }

        let className = 'suggestion-list__item';
        if (isSelection) {
            className += ' suggestion--selected';
        }

        let name = channel.display_name;
        let description = '~' + channel.name;
        let icon;
        if (channelIsArchived) {
            icon = (
                <span className='suggestion-list__icon suggestion-list__icon--large'>
                    <i className='icon icon-archive-outline'/>
                </span>
            );
        } else if (this.props.hasDraft) {
            icon = (
                <span className='suggestion-list__icon suggestion-list__icon--large'>
                    <i className='icon icon-pencil-outline'/>
                </span>
            );
        } else if (channel.type === Constants.OPEN_CHANNEL) {
            icon = (
                <span className='suggestion-list__icon suggestion-list__icon--large'>
                    <i className='icon icon-globe'/>
                </span>
            );
        } else if (channel.type === Constants.PRIVATE_CHANNEL) {
            icon = (
                <span className='suggestion-list__icon suggestion-list__icon--large'>
                    <i className='icon icon-lock-outline'/>
                </span>
            );
        } else if (channel.type === Constants.GM_CHANNEL) {
            icon = (
                <span className='suggestion-list__icon suggestion-list__icon--large'>
                    <div className='status status--group'>{'G'}</div>
                </span>
            );
        } else {
            icon = (
                <ProfilePicture
                    src={userImageUrl}
                    status={teammate && teammate.is_bot ? null : status}
                    size='sm'
                />
            );
        }

        let tag = null;
        let customStatus = null;
        if (channel.type === Constants.DM_CHANNEL) {
            tag = (
                <React.Fragment>
                    <BotBadge
                        show={Boolean(teammate && teammate.is_bot)}
                        className='badge-autocomplete'
                    />
                    <GuestBadge
                        show={Boolean(teammate && Utils.isGuest(teammate))}
                        className='badge-autocomplete'
                    />
                </React.Fragment>
            );

            customStatus = (
                <CustomStatusEmoji
                    showTooltip={true}
                    userID={userItem.id}
                    emojiStyle={{
                        marginBottom: 2,
                        marginLeft: 8,
                    }}
                />
            );

            let deactivated = '';
            if (userItem.delete_at) {
                deactivated = (' - ' + Utils.localizeMessage('channel_switch_modal.deactivated', 'Deactivated'));
            }

            if (channel.display_name && !(teammate && teammate.is_bot)) {
                description = '@' + userItem.username + deactivated;
            } else {
                name = userItem.username;
                description = deactivated;
            }
        } else if (channel.type === Constants.GM_CHANNEL) {
            // remove the slug from the option
            name = channel.display_name;
            description = '';
        }

        let sharedIcon = null;
        if (channel.shared) {
            sharedIcon = (
                <SharedChannelIndicator
                    className='shared-channel-icon'
                    channelType={channel.type}
                />
            );
        }

        return (
            <div
                onClick={this.handleClick}
                onMouseMove={this.handleMouseMove}
                className={className}
                role='listitem'
                ref={(node) => {
                    this.node = node;
                }}
                id={`switchChannel_${channel.name}`}
                data-testid={channel.name}
                aria-label={name}
                {...Suggestion.baseProps}
            >
                {icon}
                <div className='suggestion-list__ellipsis'>
                    <span className='suggestion-list__main'>
                        {name}
                    </span>
                    <span className='ml-2'>{description}</span>
                </div>
                {customStatus}
                {sharedIcon}
                {tag}
                {badge}
            </div>
        );
    }
}

function mapStateToPropsForSwitchChannelSuggestion(state, ownProps) {
    const channel = ownProps.item && ownProps.item.channel;
    const channelId = channel ? channel.id : '';
    const draft = channelId ? getPostDraft(state, StoragePrefixes.DRAFT, channelId) : false;
    const user = channel && getUser(state, channel.userId);
    const userImageUrl = user && Utils.imageURLForUser(user.id, user.last_picture_update);
    let dmChannelTeammate = channel && channel.type === Constants.DM_CHANNEL && getDirectTeammate(state, channel.id);
    const userItem = getUserByUsername(state, channel.name);
    const status = getStatusForUserId(state, channel.userId);
    const collapsedThreads = isCollapsedThreadsEnabled(state);

    if (channel && !dmChannelTeammate) {
        dmChannelTeammate = getUser(state, channel.userId);
    }

    return {
        channelMember: getMyChannelMemberships(state)[channelId],
        hasDraft: draft && Boolean(draft.message.trim() || draft.fileInfos.length || draft.uploadsInProgress.length),
        userImageUrl,
        dmChannelTeammate,
        status,
        userItem,
        collapsedThreads,
    };
}

const ConnectedSwitchChannelSuggestion = connect(mapStateToPropsForSwitchChannelSuggestion, null, null, {forwardRef: true})(SwitchChannelSuggestion);

let prefix = '';

function sortChannelsByRecencyAndTypeAndDisplayName(wrappedA, wrappedB) {
    if (wrappedA.last_viewed_at && wrappedB.last_viewed_at) {
        return wrappedB.last_viewed_at - wrappedA.last_viewed_at;
    } else if (wrappedA.last_viewed_at) {
        return -1;
    } else if (wrappedB.last_viewed_at) {
        return 1;
    }

    return sortChannelsByTypeAndDisplayName('en', wrappedA.channel, wrappedB.channel);
}

export function quickSwitchSorter(wrappedA, wrappedB) {
    const aIsArchived = wrappedA.channel.delete_at ? wrappedA.channel.delete_at !== 0 : false;
    const bIsArchived = wrappedB.channel.delete_at ? wrappedB.channel.delete_at !== 0 : false;

    if (aIsArchived && !bIsArchived) {
        return 1;
    } else if (!aIsArchived && bIsArchived) {
        return -1;
    }

    if (wrappedA.deactivated && !wrappedB.deactivated) {
        return 1;
    } else if (wrappedB.deactivated && !wrappedA.deactivated) {
        return -1;
    }

    const a = wrappedA.channel;
    const b = wrappedB.channel;

    let aDisplayName = a.display_name.toLowerCase();
    let bDisplayName = b.display_name.toLowerCase();

    if (a.type === Constants.DM_CHANNEL && aDisplayName.startsWith('@')) {
        aDisplayName = aDisplayName.substring(1);
    }

    if (b.type === Constants.DM_CHANNEL && bDisplayName.startsWith('@')) {
        bDisplayName = bDisplayName.substring(1);
    }

    const aStartsWith = aDisplayName.startsWith(prefix);
    const bStartsWith = bDisplayName.startsWith(prefix);

    // Open channels user havent interacted should be at the  bottom of the list
    if (a.type === Constants.OPEN_CHANNEL && !wrappedA.last_viewed_at && (b.type !== Constants.OPEN_CHANNEL || wrappedB.last_viewed_at)) {
        return 1;
    } else if (b.type === Constants.OPEN_CHANNEL && !wrappedB.last_viewed_at) {
        return -1;
    }

    // Sort channels starting with the search term first
    if (aStartsWith && !bStartsWith) {
        return -1;
    } else if (!aStartsWith && bStartsWith) {
        return 1;
    }

    // Sort recently viewed channels first
    if (wrappedA.last_viewed_at && wrappedB.last_viewed_at) {
        return wrappedB.last_viewed_at - wrappedA.last_viewed_at;
    } else if (wrappedA.last_viewed_at) {
        return -1;
    } else if (wrappedB.last_viewed_at) {
        return 1;
    }

    // MM-12677 When this is migrated this needs to be fixed to pull the user's locale
    return sortChannelsByTypeAndDisplayName('en', a, b);
}

function makeChannelSearchFilter(channelPrefix) {
    const channelPrefixLower = channelPrefix.toLowerCase();
    const splitPrefixBySpace = channelPrefixLower.trim().split(/[ ,]+/);
    const curState = getState();
    const usersInChannels = getUserIdsInChannels(curState);
    const userSearchStrings = {};

    return (channel) => {
        let searchString = `${channel.display_name}${channel.name}`;
        if (channel.type === Constants.GM_CHANNEL || channel.type === Constants.DM_CHANNEL) {
            const usersInChannel = usersInChannels[channel.id] || new Set([]);

            // In case the channel is a DM and the profilesInChannel is not populated
            if (!usersInChannel.size && channel.type === Constants.DM_CHANNEL) {
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

        if (splitPrefixBySpace.length > 1) {
            const lowerCaseSearch = searchString.toLowerCase();
            return splitPrefixBySpace.every((searchPrefix) => {
                return lowerCaseSearch.includes(searchPrefix);
            });
        }

        return searchString.toLowerCase().includes(channelPrefixLower);
    };
}

export default class SwitchChannelProvider extends Provider {
    handlePretextChanged(channelPrefix, resultsCallback) {
        if (channelPrefix) {
            prefix = channelPrefix;
            this.startNewRequest(channelPrefix);
            if (this.shouldCancelDispatch(channelPrefix)) {
                return false;
            }

            // Dispatch suggestions for local data
            const channels = getChannelsInCurrentTeam(getState()).concat(getDirectAndGroupChannels(getState()));
            const users = Object.assign([], searchProfilesMatchingWithTerm(getState(), channelPrefix, false));
            const formattedData = this.formatList(channelPrefix, channels, users);
            if (formattedData) {
                resultsCallback(formattedData);
            }

            // Fetch data from the server and dispatch
            this.fetchUsersAndChannels(channelPrefix, resultsCallback);
        } else {
            this.fetchAndFormatRecentlyViewedChannels(resultsCallback);
        }

        return true;
    }

    async fetchUsersAndChannels(channelPrefix, resultsCallback) {
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

        const channelsAsync = searchChannels(teamId, channelPrefix)(store.dispatch, store.getState);

        let usersFromServer = [];
        let channelsFromServer = [];

        try {
            usersFromServer = await usersAsync;
            const {data} = await channelsAsync;
            channelsFromServer = data;
        } catch (err) {
            store.dispatch(logError(err));
        }

        if (this.shouldCancelDispatch(channelPrefix)) {
            return;
        }

        const currentUserId = getCurrentUserId(state);

        const localChannelData = getChannelsInCurrentTeam(state).concat(getDirectAndGroupChannels(state)) || [];
        const localUserData = Object.assign([], searchProfilesMatchingWithTerm(state, channelPrefix, false)) || [];
        const localFormattedData = this.formatList(channelPrefix, localChannelData, localUserData);

        const remoteChannelData = channelsFromServer.concat(getGroupChannels(state)) || [];
        const remoteUserData = Object.assign([], usersFromServer.users) || [];
        const remoteFormattedData = this.formatList(channelPrefix, remoteChannelData, remoteUserData, false);

        store.dispatch({
            type: UserTypes.RECEIVED_PROFILES_LIST,
            data: [...localUserData.filter((user) => user.id !== currentUserId), ...remoteUserData.filter((user) => user.id !== currentUserId)],
        });
        const combinedTerms = [...localFormattedData.terms, ...remoteFormattedData.terms.filter((term) => !localFormattedData.terms.includes(term))];
        const combinedItems = [...localFormattedData.items, ...remoteFormattedData.items.filter((item) => !localFormattedData.terms.includes(item.channel.userId || item.channel.id))];

        resultsCallback({
            ...localFormattedData,
            ...{
                items: combinedItems,
                terms: combinedTerms,
            },
        });
    }

    userWrappedChannel(user, channel) {
        let displayName = '';

        // The naming format is fullname (nickname)
        // username is shown seperately
        if ((user.first_name || user.last_name) && user.nickname) {
            displayName += `${Utils.getFullName(user)} (${user.nickname})`;
        } else if (user.nickname && !user.first_name && !user.last_name) {
            displayName += `${user.nickname}`;
        } else if (user.first_name || user.last_name) {
            displayName += `${Utils.getFullName(user)}`;
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

    formatList(channelPrefix, allChannels, users, skipNotMember = true) {
        const channels = [];

        const members = getMyChannelMemberships(getState());

        const completedChannels = {};

        const channelFilter = makeChannelSearchFilter(channelPrefix);

        const state = getState();
        const config = getConfig(state);
        const viewArchivedChannels = config.ExperimentalViewArchivedChannels === 'true';

        for (const id of Object.keys(allChannels)) {
            const channel = allChannels[id];

            if (completedChannels[channel.id]) {
                continue;
            }

            if (channelFilter(channel)) {
                const newChannel = Object.assign({}, channel);
                const channelIsArchived = channel.delete_at !== 0;

                let wrappedChannel = {channel: newChannel, name: newChannel.name, deactivated: false};
                if (members[channel.id]) {
                    wrappedChannel.last_viewed_at = members[channel.id].last_viewed_at;
                } else if (skipNotMember) {
                    continue;
                }

                if (!viewArchivedChannels && channelIsArchived) {
                    continue;
                } else if (channelIsArchived && members[channel.id]) {
                    wrappedChannel.type = Constants.ARCHIVED_CHANNEL;
                } else if (channelIsArchived && !members[channel.id]) {
                    continue;
                } else if (newChannel.type === Constants.GM_CHANNEL) {
                    newChannel.name = newChannel.display_name;
                    wrappedChannel.name = newChannel.name;
                    const isGMVisible = isGroupChannelManuallyVisible(state, channel.id);
                    if (!isGMVisible && skipNotMember) {
                        continue;
                    }
                } else if (newChannel.type === Constants.DM_CHANNEL) {
                    const userId = Utils.getUserIdFromChannelId(newChannel.name);
                    const user = users.find((u) => u.id === userId);

                    if (user) {
                        completedChannels[user.id] = true;
                        wrappedChannel = this.userWrappedChannel(
                            user,
                            newChannel,
                        );
                        if (members[channel.id]) {
                            wrappedChannel.last_viewed_at = members[channel.id].last_viewed_at;
                        }
                    } else {
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

            const wrappedChannel = this.userWrappedChannel(user);

            const currentUserId = getCurrentUserId(getState());

            const channelName = Utils.getDirectChannelName(currentUserId, user.id);
            const channel = getChannelByName(getState(), channelName);

            if (channel && members[channel.id]) {
                wrappedChannel.last_viewed_at = members[channel.id].last_viewed_at;
            } else if (skipNotMember) {
                continue;
            }

            completedChannels[user.id] = true;
            channels.push(wrappedChannel);
        }

        const channelNames = channels.
            sort(quickSwitchSorter).
            map((wrappedChannel) => wrappedChannel.channel.userId || wrappedChannel.channel.id);

        return {
            matchedPretext: channelPrefix,
            terms: channelNames,
            items: channels,
            component: ConnectedSwitchChannelSuggestion,
        };
    }

    fetchAndFormatRecentlyViewedChannels(resultsCallback) {
        const state = getState();
        const recentChannels = getChannelsInCurrentTeam(state).concat(getDirectAndGroupChannels(state));
        const channels = this.wrapChannels(recentChannels, Constants.MENTION_RECENT_CHANNELS);
        if (channels.length === 0) {
            prefix = '';
            this.startNewRequest('');
            this.fetchChannels(resultsCallback);
        }
        const sortedChannels = channels.sort(sortChannelsByRecencyAndTypeAndDisplayName).slice(0, 20);
        const channelNames = sortedChannels.map((wrappedChannel) => wrappedChannel.channel.id);
        resultsCallback({
            matchedPretext: '',
            terms: channelNames,
            items: sortedChannels,
            component: ConnectedSwitchChannelSuggestion,
        });
    }
    getTimestampFromPrefs(myPreferences, category, name) {
        const pref = myPreferences[getPreferenceKey(category, name)];
        const prefValue = pref ? pref.value : '0';
        return parseInt(prefValue, 10);
    }
    getLastViewedAt(myMembers, myPreferences, channel) {
        // The server only ever sets the last_viewed_at to the time of the last post in channel,
        // So thought of using preferences but it seems that also not keeping track.
        // TODO Update and remove comment once solution is finalized
        return Math.max(
            myMembers[channel.id]?.last_viewed_at,
            this.getTimestampFromPrefs(myPreferences, Preferences.CATEGORY_CHANNEL_APPROXIMATE_VIEW_TIME, channel.id),
            this.getTimestampFromPrefs(myPreferences, Preferences.CATEGORY_CHANNEL_OPEN_TIME, channel.id),
        );
    }

    wrapChannels(channels, channelType) {
        const state = getState();
        const currentChannel = getCurrentChannel(state);
        const myMembers = getMyChannelMemberships(state);
        const myPreferences = getMyPreferences(state);

        const channelList = [];
        for (let i = 0; i < channels.length; i++) {
            const channel = channels[i];
            if (channel.id === currentChannel?.id) {
                continue;
            }
            let wrappedChannel = {channel, name: channel.name, deactivated: false};
            if (myMembers[channel.id]) {
                wrappedChannel.last_viewed_at = this.getLastViewedAt(myMembers, myPreferences, channel);
            }
            if (channel.type === Constants.GM_CHANNEL) {
                wrappedChannel.name = channel.display_name;
            } else if (channel.type === Constants.DM_CHANNEL) {
                const user = getUser(getState(), Utils.getUserIdFromChannelId(channel.name));

                if (!user) {
                    continue;
                }
                const userWrappedChannel = this.userWrappedChannel(
                    user,
                    channel,
                );
                wrappedChannel = {...wrappedChannel, ...userWrappedChannel};
            }
            wrappedChannel.type = channelType;
            channelList.push(wrappedChannel);
        }
        return channelList;
    }

    async fetchChannels(resultsCallback, size = 20) {
        const state = getState();
        const teamId = getCurrentTeamId(state);
        if (!teamId) {
            return;
        }
        const channelsAsync = getChannels(teamId, 0, size)(store.dispatch, store.getState);
        let channels;

        try {
            const {data} = await channelsAsync;
            channels = data;
        } catch (err) {
            store.dispatch(logError(err));
        }

        if (this.latestPrefix !== '') {
            return;
        }
        const sortedChannels = this.wrapChannels(channels, Constants.MENTION_PUBLIC_CHANNELS).slice(0, 20);
        const channelNames = sortedChannels.map((wrappedChannel) => wrappedChannel.channel.id);

        resultsCallback({
            matchedPretext: '',
            terms: channelNames,
            items: sortedChannels,
            component: ConnectedSwitchChannelSuggestion,
        });
    }
}
