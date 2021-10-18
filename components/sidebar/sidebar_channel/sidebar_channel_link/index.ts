// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch} from 'redux';

import {getCurrentUserId, getMyChannelMemberships} from 'mattermost-redux/selectors/entities/common';
import {getInt} from 'mattermost-redux/selectors/entities/preferences';

import {Channel} from 'mattermost-redux/types/channels';
import {GenericAction} from 'mattermost-redux/types/actions';
import {isChannelMuted} from 'mattermost-redux/utils/channel_utils';
import {getChannelsNameMapInCurrentTeam, makeGetChannelUnreadCount} from 'mattermost-redux/selectors/entities/channels';
import {getConfig} from 'mattermost-redux/selectors/entities/general';

import {open as openLhs} from 'actions/views/lhs.js';
import {clearChannelSelection, multiSelectChannelAdd, multiSelectChannelTo} from 'actions/views/channel_sidebar';
import {isChannelSelected} from 'selectors/views/channel_sidebar';
import {GlobalState} from 'types/store';
import Constants from 'utils/constants';

import SidebarChannelLink from './sidebar_channel_link';

type OwnProps = {
    channel: Channel;
}

function makeMapStateToProps() {
    const getUnreadCount = makeGetChannelUnreadCount();

    return (state: GlobalState, ownProps: OwnProps) => {
        const member = getMyChannelMemberships(state)[ownProps.channel.id];

        const unreadCount = getUnreadCount(state, ownProps.channel.id);

        const channelsByName = getChannelsNameMapInCurrentTeam(state);
        const config = getConfig(state);
        const enableTutorial = config.EnableTutorial === 'true';
        const currentUserId = getCurrentUserId(state);
        const tutorialStep = getInt(state, Constants.Preferences.TUTORIAL_STEP, currentUserId, Constants.TutorialSteps.FINISHED);

        return {
            unreadMentions: unreadCount.mentions,
            unreadMsgs: unreadCount.messages,
            isUnread: unreadCount.showUnread,
            isMuted: isChannelMuted(member),
            isChannelSelected: isChannelSelected(state, ownProps.channel.id),
            showTutorialTip: enableTutorial && tutorialStep === Constants.TutorialSteps.CHANNEL_POPOVER,
            townSquareDisplayName: channelsByName[Constants.DEFAULT_CHANNEL]?.display_name || '',
            offTopicDisplayName: channelsByName[Constants.OFFTOPIC_CHANNEL]?.display_name || '',
        };
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

export default connect(makeMapStateToProps, mapDispatchToProps)(SidebarChannelLink);
