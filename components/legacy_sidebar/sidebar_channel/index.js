// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {Client4} from 'mattermost-redux/client';
import {savePreferences} from 'mattermost-redux/actions/preferences';

import {
    getCurrentChannelId,
    getChannelsNameMapInCurrentTeam,
    getRedirectChannelNameForTeam,
    isFavoriteChannel,
    makeGetChannel,
    shouldHideDefaultChannel,
} from 'mattermost-redux/selectors/entities/channels';
import {getMyChannelMemberships} from 'mattermost-redux/selectors/entities/common';
import {getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';
import {getUserIdsInChannels, getUser} from 'mattermost-redux/selectors/entities/users';
import {getInt, getTeammateNameDisplaySetting} from 'mattermost-redux/selectors/entities/preferences';
import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {isChannelMuted} from 'mattermost-redux/utils/channel_utils';

import {displayUsername} from 'mattermost-redux/utils/user_utils';

import {Constants, NotificationLevels, StoragePrefixes} from 'utils/constants';

import {leaveChannel, leaveDirectChannel} from 'actions/views/channel';
import {open as openLhs} from 'actions/views/lhs.js';
import {getPostDraft} from 'selectors/rhs';

import SidebarChannel from './sidebar_channel.jsx';

function makeMapStateToProps() {
    const getChannel = makeGetChannel();

    return (state, ownProps) => {
        const channelId = ownProps.channelId;

        const config = getConfig(state);
        const currentChannelId = getCurrentChannelId(state);
        const channel = getChannel(state, {id: channelId}) || {};
        const draft = channel.id ? getPostDraft(state, StoragePrefixes.DRAFT, channel.id) : false;

        const enableTutorial = config.EnableTutorial === 'true';
        const tutorialStep = getInt(state, Constants.Preferences.TUTORIAL_STEP, ownProps.currentUserId, Constants.TutorialSteps.FINISHED);
        const channelsByName = getChannelsNameMapInCurrentTeam(state);
        const memberIds = getUserIdsInChannels(state);

        let membersCount = 0;
        if (memberIds && memberIds[channel.id]) {
            membersCount = memberIds[channel.id].size;
            if (memberIds[channel.id].has(ownProps.currentUserId)) {
                membersCount--;
            }
        }

        const member = getMyChannelMemberships(state)[channelId];

        let unreadMentions = 0;
        let unreadMsgs = 0;
        let showUnreadForMsgs = true;
        if (member) {
            unreadMentions = member.mention_count;

            if (channel) {
                unreadMsgs = Math.max(channel.total_msg_count - member.msg_count, 0);
            }

            if (member.notify_props) {
                showUnreadForMsgs = member.notify_props.mark_unread !== NotificationLevels.MENTION;
            }
        }

        const teammateNameDisplay = getTeammateNameDisplaySetting(state);
        let teammate = null;
        let channelTeammateId = '';
        let channelTeammateDeletedAt = 0;
        let channelTeammateUsername = '';
        let channelTeammateIsBot = false;
        let botLastIconUpdate = 0;
        let channelDisplayName = channel.display_name;
        let botIconUrl = null;
        if (channel.type === Constants.DM_CHANNEL) {
            teammate = getUser(state, channel.teammate_id);
            if (teammate) {
                channelTeammateId = teammate.id;
                channelTeammateDeletedAt = teammate.delete_at;
                channelTeammateUsername = teammate.username;
                channelTeammateIsBot = teammate.is_bot;
                botLastIconUpdate = teammate.bot_last_icon_update;
                botLastIconUpdate = (typeof botLastIconUpdate === 'undefined') ? 0 : botLastIconUpdate;
            }
            if (channelTeammateIsBot) {
                if (botLastIconUpdate !== 0) {
                    botIconUrl = botIconImageUrl(teammate);
                }
            }
            channelDisplayName = displayUsername(teammate, teammateNameDisplay, false);
        }

        let shouldHideChannel = false;
        if (
            channel.name === Constants.DEFAULT_CHANNEL &&
            !ownProps.active &&
            shouldHideDefaultChannel(state, channel) &&
            !isFavoriteChannel(state, channel.id)
        ) {
            shouldHideChannel = true;
        }

        return {
            config,
            channelId,
            channelName: channel.name,
            channelDisplayName,
            botIconUrl,
            channelType: channel.type,
            channelStatus: channel.status,
            channelFake: channel.fake,
            channelMuted: isChannelMuted(member),
            channelStringified: channel.fake && JSON.stringify(channel),
            channelTeammateId,
            channelTeammateUsername,
            channelTeammateDeletedAt,
            channelTeammateIsBot,
            hasDraft: draft && Boolean(draft.message.trim() || draft.fileInfos.length || draft.uploadsInProgress.length) && currentChannelId !== channel.id,
            showTutorialTip: enableTutorial && tutorialStep === Constants.TutorialSteps.CHANNEL_POPOVER,
            townSquareDisplayName: channelsByName[Constants.DEFAULT_CHANNEL] && channelsByName[Constants.DEFAULT_CHANNEL].display_name,
            offTopicDisplayName: channelsByName[Constants.OFFTOPIC_CHANNEL] && channelsByName[Constants.OFFTOPIC_CHANNEL].display_name,
            showUnreadForMsgs,
            unreadMsgs,
            unreadMentions,
            membersCount,
            shouldHideChannel,
            channelIsArchived: channel.delete_at !== 0,
            redirectChannel: getRedirectChannelNameForTeam(state, getCurrentTeamId(state)),
        };
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            savePreferences,
            leaveChannel,
            leaveDirectChannel,
            openLhs,
        }, dispatch),
    };
}

/**
 * Gets the LHS bot icon url for a given botUser.
 */
function botIconImageUrl(botUser) {
    return `${Client4.getBotRoute(botUser.id)}/icon?_=${(botUser.bot_last_icon_update || 0)}`;
}

export default connect(makeMapStateToProps, mapDispatchToProps, null, {forwardRef: true})(SidebarChannel);
