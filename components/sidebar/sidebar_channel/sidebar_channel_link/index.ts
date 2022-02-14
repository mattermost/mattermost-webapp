// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch} from 'redux';

import {getMyChannelMemberships} from 'mattermost-redux/selectors/entities/common';
import {getBool, getInt} from 'mattermost-redux/selectors/entities/preferences';

import {Channel} from 'mattermost-redux/types/channels';
import {GenericAction} from 'mattermost-redux/types/actions';
import {isChannelMuted} from 'mattermost-redux/utils/channel_utils';
import {makeGetChannelUnreadCount} from 'mattermost-redux/selectors/entities/channels';
import {getConfig} from 'mattermost-redux/selectors/entities/general';

import {clearChannelSelection, multiSelectChannelAdd, multiSelectChannelTo} from 'actions/views/channel_sidebar';
import {getFirstChannelName} from 'selectors/onboarding';
import {isChannelSelected} from 'selectors/views/channel_sidebar';
import {GlobalState} from 'types/store';
import {
    GenericTaskSteps,
    OnBoardingTaskCategory,
    OnBoardingTasksName,
} from 'components/onboarding_tasks';
import {ChannelsTour, OnBoardingTourSteps, TutorialTourName} from 'components/onboarding_tour';
import {Preferences, RecommendedNextSteps} from '../../../../utils/constants';
import {isFirstAdmin, nextStepsNotFinished} from '../../../next_steps_view/steps';

import SidebarChannelLink from './sidebar_channel_link';

type OwnProps = {
    channel: Channel;
}

function makeMapStateToProps() {
    const getUnreadCount = makeGetChannelUnreadCount();

    return (state: GlobalState, ownProps: OwnProps) => {
        const member = getMyChannelMemberships(state)[ownProps.channel.id];
        const unreadCount = getUnreadCount(state, ownProps.channel.id);
        const firstChannelName = getFirstChannelName(state);
        const config = getConfig(state);
        const enableTutorial = config.EnableTutorial === 'true';
        const tutorialStep = getInt(state, ChannelsTour, TutorialTourName.ON_BOARDING_STEP, 0);
        const triggerStep = getInt(state, OnBoardingTaskCategory, OnBoardingTasksName.CHANNELS_TOUR, 0);
        const channelTourTriggered = triggerStep === GenericTaskSteps.STARTED;
        const nextStep = nextStepsNotFinished(state);
        const isUserFirstAdmin = isFirstAdmin(state);
        const isRecommendedStepSkipped = getBool(state, Preferences.RECOMMENDED_NEXT_STEPS, RecommendedNextSteps.SKIP);
        const showChannelsTour = tutorialStep === OnBoardingTourSteps.CHANNELS_AND_DIRECT_MESSAGES;
        const showChannelsTutorialStep = enableTutorial && showChannelsTour && ((channelTourTriggered && isUserFirstAdmin) || ((!nextStep || isRecommendedStepSkipped) && !isUserFirstAdmin));

        return {
            unreadMentions: unreadCount.mentions,
            unreadMsgs: unreadCount.messages,
            isUnread: unreadCount.showUnread,
            isMuted: isChannelMuted(member),
            isChannelSelected: isChannelSelected(state, ownProps.channel.id),
            firstChannelName: showChannelsTutorialStep ? firstChannelName : '',
            showChannelsTutorialStep,
        };
    };
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators({
            clearChannelSelection,
            multiSelectChannelTo,
            multiSelectChannelAdd,
        }, dispatch),
    };
}

export default connect(makeMapStateToProps, mapDispatchToProps)(SidebarChannelLink);
