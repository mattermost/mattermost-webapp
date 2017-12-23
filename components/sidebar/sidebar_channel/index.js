// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {getChannel, getChannelsNameMapInCurrentTeam} from 'mattermost-redux/selectors/entities/channels';
import {getUserIdsInChannels, getUser} from 'mattermost-redux/selectors/entities/users';
import {get as getPreference} from 'mattermost-redux/selectors/entities/preferences';
import {savePreferences} from 'mattermost-redux/actions/preferences';
import {leaveChannel} from 'mattermost-redux/actions/channels';
import {getConfig} from 'mattermost-redux/selectors/entities/general';

import {Constants} from 'utils/constants.jsx';

import SidebarChannel from './sidebar_channel.jsx';

function mapStateToProps(state, ownProps) {
    const config = getConfig(state);
    const channel = getChannel(state, ownProps.channelId);
    const tutorialStep = getPreference(state, Constants.Preferences.TUTORIAL_STEP, ownProps.currentUserId, 999);
    const channelsByName = getChannelsNameMapInCurrentTeam(state);
    const memberIds = getUserIdsInChannels(state);

    let membersCount = 0;
    if (memberIds && memberIds[channel.id]) {
        membersCount = memberIds[channel.id].size;
        if (memberIds[channel.id].has(ownProps.currentUserId)) {
            membersCount--;
        }
    }

    let unreadMentions = 0;
    let unreadMsgs = 0;
    const m = ownProps.membership;

    if (channel.type === 'D') {
        unreadMentions = channel.total_msg_count - m.msg_count;
    } else if (m.mention_count > 0) {
        unreadMentions = m.mention_count;
    }
    if (m.notify_props && m.notify_props.mark_unread !== 'mention' && channel.total_msg_count - m.msg_count > 0) {
        unreadMsgs = 1;
    }

    let teammate = null;
    if (channel.teammate_id) {
        teammate = getUser(state, channel.teammate_id);
    }

    return {
        config,
        channelId: channel.id,
        channelName: channel.name,
        channelDisplayName: channel.display_name,
        channelType: channel.type,
        channelStatus: channel.status,
        channelFake: channel.fake,
        channelStringified: channel.fake && JSON.stringify(channel),
        channelTeammateId: teammate && teammate.id,
        channelTeammateDeletedAt: teammate && teammate.delete_at,
        showTutorialTip: tutorialStep === Constants.TutorialSteps.CHANNEL_POPOVER && config.EnableTutorial === 'true',
        townSquareDisplayName: channelsByName[Constants.DEFAULT_CHANNEL] && channelsByName[Constants.DEFAULT_CHANNEL].display_name,
        offTopicDisplayName: channelsByName[Constants.OFFTOPIC_CHANNEL] && channelsByName[Constants.OFFTOPIC_CHANNEL].display_name,
        unreadMsgs,
        unreadMentions,
        membersCount
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            savePreferences,
            leaveChannel
        }, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps, null, {withRef: true})(SidebarChannel);
