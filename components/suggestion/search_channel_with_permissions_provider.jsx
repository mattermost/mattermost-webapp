// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {
    getChannelsInCurrentTeam,
} from 'mattermost-redux/selectors/entities/channels';
import {getMyChannelMemberships} from 'mattermost-redux/selectors/entities/common';
import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';
import * as ChannelActions from 'mattermost-redux/actions/channels';
import {getCurrentUserLocale} from 'mattermost-redux/selectors/entities/i18n';
import {haveIChannelPermission} from 'mattermost-redux/selectors/entities/roles';
import {Permissions} from 'mattermost-redux/constants';
import {sortChannelsByTypeAndDisplayName} from 'mattermost-redux/utils/channel_utils';
import {logError} from 'mattermost-redux/actions/errors';

import GlobeIcon from 'components/widgets/icons/globe_icon';
import LockIcon from 'components/widgets/icons/lock_icon';
import ArchiveIcon from 'components/widgets/icons/archive_icon';
import store from 'stores/redux_store.jsx';
import {Constants} from 'utils/constants.jsx';

import Provider from './provider.jsx';
import Suggestion from './suggestion.jsx';

class SearchChannelWithPermissionsSuggestion extends Suggestion {
    static get propTypes() {
        return {
            ...super.propTypes,
        };
    }

    render() {
        const {item, isSelection} = this.props;
        const channel = item.channel;
        const channelIsArchived = channel.delete_at && channel.delete_at !== 0;

        let className = 'mentions__name';
        if (isSelection) {
            className += ' suggestion--selected';
        }

        const displayName = channel.display_name;
        let icon = null;
        if (channelIsArchived) {
            icon = (
                <ArchiveIcon className='icon icon__archive'/>
            );
        } else if (channel.type === Constants.OPEN_CHANNEL) {
            icon = (
                <GlobeIcon className='icon icon__globe icon--body'/>
            );
        } else if (channel.type === Constants.PRIVATE_CHANNEL) {
            icon = (
                <LockIcon className='icon icon__lock icon--body'/>
            );
        }

        return (
            <div
                onClick={this.handleClick}
                className={className}
                {...Suggestion.baseProps}
            >
                {icon}
                {displayName}
            </div>
        );
    }
}

let prefix = '';

function channelSearchSorter(wrappedA, wrappedB) {
    const aIsArchived = wrappedA.channel.delete_at ? wrappedA.channel.delete_at !== 0 : false;
    const bIsArchived = wrappedB.channel.delete_at ? wrappedB.channel.delete_at !== 0 : false;
    if (aIsArchived && !bIsArchived) {
        return 1;
    } else if (!aIsArchived && bIsArchived) {
        return -1;
    }

    const locale = getCurrentUserLocale(store.getState());

    const a = wrappedA.channel;
    const b = wrappedB.channel;

    const aDisplayName = a.display_name.toLowerCase();
    const bDisplayName = b.display_name.toLowerCase();

    const aStartsWith = aDisplayName.startsWith(prefix);
    const bStartsWith = bDisplayName.startsWith(prefix);
    if (aStartsWith && bStartsWith) {
        return sortChannelsByTypeAndDisplayName(locale, a, b);
    } else if (!aStartsWith && !bStartsWith) {
        return sortChannelsByTypeAndDisplayName(locale, a, b);
    } else if (aStartsWith) {
        return -1;
    }

    return 1;
}

export default class SearchChannelWithPermissionsProvider extends Provider {
    makeChannelSearchFilter(channelPrefix) {
        const channelPrefixLower = channelPrefix.toLowerCase();

        return (channel) => {
            const state = store.getState();
            const channelId = channel.id;
            const teamId = getCurrentTeamId(state);

            const searchString = channel.display_name;

            if (channel.type === Constants.OPEN_CHANNEL &&
                haveIChannelPermission(state, {channel: channelId, team: teamId, permission: Permissions.MANAGE_PUBLIC_CHANNEL_MEMBERS})) {
                return searchString.toLowerCase().includes(channelPrefixLower);
            } else if (channel.type === Constants.PRIVATE_CHANNEL &&
                haveIChannelPermission(state, {channel: channelId, team: teamId, permission: Permissions.MANAGE_PRIVATE_CHANNEL_MEMBERS})) {
                return searchString.toLowerCase().includes(channelPrefixLower);
            }

            return false;
        };
    }

    handlePretextChanged(channelPrefix, resultsCallback) {
        if (channelPrefix) {
            prefix = channelPrefix;
            this.startNewRequest(channelPrefix);
            const state = store.getState();

            // Dispatch suggestions for local data
            const channels = getChannelsInCurrentTeam(state);
            this.formatChannelsAndDispatch(channelPrefix, resultsCallback, channels);

            // Fetch data from the server and dispatch
            this.fetchChannels(channelPrefix, resultsCallback);
        }

        return true;
    }

    async fetchChannels(channelPrefix, resultsCallback) {
        const state = store.getState();
        const teamId = getCurrentTeamId(state);
        if (!teamId) {
            return;
        }

        const channelsAsync = ChannelActions.autocompleteChannelsForSearch(teamId, channelPrefix)(store.dispatch, store.getState);

        let channelsFromServer = [];
        try {
            const {data} = await channelsAsync;
            channelsFromServer = data;
        } catch (err) {
            store.dispatch(logError(err));
        }

        if (this.shouldCancelDispatch(channelPrefix)) {
            return;
        }

        const channels = getChannelsInCurrentTeam(state).concat(channelsFromServer);
        this.formatChannelsAndDispatch(channelPrefix, resultsCallback, channels);
    }

    formatChannelsAndDispatch(channelPrefix, resultsCallback, allChannels) {
        const channels = [];

        const state = store.getState();

        const members = getMyChannelMemberships(state);

        if (this.shouldCancelDispatch(channelPrefix)) {
            return;
        }

        const completedChannels = {};

        const channelFilter = this.makeChannelSearchFilter(channelPrefix);

        const config = getConfig(state);
        const viewArchivedChannels = config.ExperimentalViewArchivedChannels === 'true';

        for (const id of Object.keys(allChannels)) {
            const channel = allChannels[id];
            if (!channel) {
                continue;
            }

            if (completedChannels[channel.id]) {
                continue;
            }

            if (channelFilter(channel)) {
                const newChannel = Object.assign({}, channel);
                const channelIsArchived = channel.delete_at !== 0;

                const wrappedChannel = {channel: newChannel, name: newChannel.name, deactivated: false};
                if (!viewArchivedChannels && channelIsArchived) {
                    continue;
                } else if (!members[channel.id]) {
                    continue;
                } else if (channelIsArchived && !members[channel.id]) {
                    continue;
                } else if (channel.type === Constants.OPEN_CHANNEL) {
                    wrappedChannel.type = Constants.OPEN_CHANNEL;
                } else if (channel.type === Constants.PRIVATE_CHANNEL) {
                    wrappedChannel.type = Constants.PRIVATE_CHANNEL;
                } else {
                    continue;
                }
                completedChannels[channel.id] = true;
                channels.push(wrappedChannel);
            }
        }

        const channelNames = channels.
            sort(channelSearchSorter).
            map((wrappedChannel) => wrappedChannel.channel.name);

        resultsCallback({
            matchedPretext: channelPrefix,
            terms: channelNames,
            items: channels,
            component: SearchChannelWithPermissionsSuggestion,
        });
    }
}
