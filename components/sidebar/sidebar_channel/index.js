// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {getChannelsNameMapInCurrentTeam, getMyChannelMemberships, makeGetChannel} from 'mattermost-redux/selectors/entities/channels';
import {getUserIdsInChannels, getUser} from 'mattermost-redux/selectors/entities/users';
import {get as getPreference} from 'mattermost-redux/selectors/entities/preferences';
import {savePreferences} from 'mattermost-redux/actions/preferences';
import {leaveChannel} from 'mattermost-redux/actions/channels';
import {getConfig} from 'mattermost-redux/selectors/entities/general';

import {Constants, NotificationLevels} from 'utils/constants.jsx';

import SidebarChannel from './sidebar_channel.jsx';

function makeMapStateToProps() {
    const getChannel = makeGetChannel();

    return (state, ownProps) => {
        const channelId = ownProps.channelId;

        const config = getConfig(state);
        const channel = getChannel(state, {id: channelId}) || {};

        const enableTutorial = config.EnableTutorial === 'true';
        const tutorialStep = parseInt(getPreference(state, Constants.Preferences.TUTORIAL_STEP, ownProps.currentUserId, Constants.TutorialSteps.FINISHED), 10);
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

        let teammate = null;
        if (channel.teammate_id) {
            teammate = getUser(state, channel.teammate_id);
        }

        return {
            config,
            channelId,
            channelName: channel.name,
            channelDisplayName: channel.display_name,
            channelType: channel.type,
            channelStatus: channel.status,
            channelFake: channel.fake,
            channelStringified: channel.fake && JSON.stringify(channel),
            channelTeammateId: teammate && teammate.id,
            channelTeammateUsername: teammate && teammate.username,
            channelTeammateDeletedAt: teammate && teammate.delete_at,
            showTutorialTip: enableTutorial && tutorialStep === Constants.TutorialSteps.CHANNEL_POPOVER,
            townSquareDisplayName: channelsByName[Constants.DEFAULT_CHANNEL] && channelsByName[Constants.DEFAULT_CHANNEL].display_name,
            offTopicDisplayName: channelsByName[Constants.OFFTOPIC_CHANNEL] && channelsByName[Constants.OFFTOPIC_CHANNEL].display_name,
            showUnreadForMsgs,
            unreadMsgs,
            unreadMentions,
            membersCount,
        };
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            savePreferences,
            leaveChannel,
        }, dispatch),
    };
}

export default connect(makeMapStateToProps, mapDispatchToProps, null, {withRef: true})(SidebarChannel);
