// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch} from 'redux';

import {getCurrentUserId, getMyChannelMemberships} from 'mattermost-redux/selectors/entities/common';
import {getInt, isCollapsedThreadsEnabled} from 'mattermost-redux/selectors/entities/preferences';

import {Channel} from 'mattermost-redux/types/channels';
import {GenericAction} from 'mattermost-redux/types/actions';
import {getMsgCountInChannel, isChannelMuted} from 'mattermost-redux/utils/channel_utils';
import {getChannelsNameMapInCurrentTeam} from 'mattermost-redux/selectors/entities/channels';
import {getConfig} from 'mattermost-redux/selectors/entities/general';

import {open as openLhs} from 'actions/views/lhs.js';
import {clearChannelSelection, multiSelectChannelAdd, multiSelectChannelTo} from 'actions/views/channel_sidebar';
import {isChannelSelected} from 'selectors/views/channel_sidebar';
import {GlobalState} from 'types/store';
import Constants, {NotificationLevels} from 'utils/constants';

import SidebarChannelLink from './sidebar_channel_link';

type OwnProps = {
    channel: Channel;
}

function mapStateToProps(state: GlobalState, ownProps: OwnProps) {
    const member = getMyChannelMemberships(state)[ownProps.channel.id];

    // Unread counts
    let unreadMentions = 0;
    let unreadMsgs = 0;
    let showUnreadForMsgs = true;
    const collapsed = isCollapsedThreadsEnabled(state);
    if (member) {
        unreadMentions = collapsed ? member.mention_count_root : member.mention_count;

        if (ownProps.channel) {
            unreadMsgs = getMsgCountInChannel(collapsed, ownProps.channel, member);
        }

        if (member.notify_props) {
            showUnreadForMsgs = member.notify_props.mark_unread !== NotificationLevels.MENTION;
        }
    }

    const channelsByName = getChannelsNameMapInCurrentTeam(state);
    const config = getConfig(state);
    const enableTutorial = config.EnableTutorial === 'true';
    const currentUserId = getCurrentUserId(state);
    const tutorialStep = getInt(state, Constants.Preferences.TUTORIAL_STEP, currentUserId, Constants.TutorialSteps.FINISHED);

    return {
        unreadMentions,
        unreadMsgs,
        showUnreadForMsgs,
        isMuted: isChannelMuted(member),
        isChannelSelected: isChannelSelected(state, ownProps.channel.id),
        showTutorialTip: enableTutorial && tutorialStep === Constants.TutorialSteps.CHANNEL_POPOVER,
        townSquareDisplayName: channelsByName[Constants.DEFAULT_CHANNEL]?.display_name || '',
        offTopicDisplayName: channelsByName[Constants.OFFTOPIC_CHANNEL]?.display_name || '',
    };
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators({
            clearChannelSelection,
            multiSelectChannelTo,
            multiSelectChannelAdd,
            openLhs,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(SidebarChannelLink);
