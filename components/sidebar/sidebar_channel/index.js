// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {savePreferences} from 'mattermost-redux/actions/preferences';
import {leaveChannel} from 'mattermost-redux/actions/channels';

import {getChannelsNameMapInCurrentTeam, makeGetChannel, isChannelReadOnly} from 'mattermost-redux/selectors/entities/channels';
import {getMyChannelMemberships} from 'mattermost-redux/selectors/entities/common';
import {getUserIdsInChannels, getUser} from 'mattermost-redux/selectors/entities/users';
import {getInt, getTeammateNameDisplaySetting} from 'mattermost-redux/selectors/entities/preferences';
import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {isChannelMuted, isFavoriteChannel} from 'mattermost-redux/utils/channel_utils';

import {displayUsername} from 'mattermost-redux/utils/user_utils';

import {Constants, NotificationLevels} from 'utils/constants.jsx';

import {open as openLhs} from 'actions/views/lhs.js';

import SidebarChannel from './sidebar_channel.jsx';

function makeMapStateToProps() {
    const getChannel = makeGetChannel();

    return (state, ownProps) => {
        const channelId = ownProps.channelId;

        const config = getConfig(state);
        const channel = getChannel(state, {id: channelId}) || {};

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
        let channelDisplayName = channel.display_name;
        if (channel.type === Constants.DM_CHANNEL) {
            teammate = getUser(state, channel.teammate_id);
            if (teammate) {
                channelTeammateId = teammate.id;
                channelTeammateDeletedAt = teammate.delete_at;
                channelTeammateUsername = teammate.username;
            }

            channelDisplayName = displayUsername(teammate, teammateNameDisplay);
        }

        const shouldHideChannel = isChannelReadOnly(state, channel) && !ownProps.active &&
            !isFavoriteChannel(state.entities.preferences.myPreferences, channel.id);

        return {
            config,
            channelId,
            channelName: channel.name,
            channelDisplayName,
            channelType: channel.type,
            channelStatus: channel.status,
            channelFake: channel.fake,
            channelMuted: isChannelMuted(member),
            channelStringified: channel.fake && JSON.stringify(channel),
            channelTeammateId,
            channelTeammateUsername,
            channelTeammateDeletedAt,
            showTutorialTip: enableTutorial && tutorialStep === Constants.TutorialSteps.CHANNEL_POPOVER,
            townSquareDisplayName: channelsByName[Constants.DEFAULT_CHANNEL] && channelsByName[Constants.DEFAULT_CHANNEL].display_name,
            offTopicDisplayName: channelsByName[Constants.OFFTOPIC_CHANNEL] && channelsByName[Constants.OFFTOPIC_CHANNEL].display_name,
            showUnreadForMsgs,
            unreadMsgs,
            unreadMentions,
            membersCount,
            shouldHideChannel,
        };
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            savePreferences,
            leaveChannel,
            openLhs,
        }, dispatch),
    };
}

export default connect(makeMapStateToProps, mapDispatchToProps, null, {withRef: true})(SidebarChannel);
