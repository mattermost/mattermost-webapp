// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch} from 'redux';

import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {GenericAction} from 'mattermost-redux/types/actions';

import {unhideNextSteps} from 'actions/views/next_steps';
import {GlobalState} from 'types/store';

import {
    showOnboarding,
    showNextStepsTips,
    showNextSteps,
} from 'components/next_steps_view/steps';

import UserGuideDropdown from './user_guide_dropdown';

function mapStateToProps(state: GlobalState) {
    const {HelpLink, ReportAProblemLink, EnableAskCommunityLink} = getConfig(state);
    return {
        helpLink: HelpLink || '',
        reportAProblemLink: ReportAProblemLink || '',
        enableAskCommunityLink: EnableAskCommunityLink || '',
        showGettingStarted: showOnboarding(state),
        showNextStepsTips: showNextStepsTips(state),
        showNextSteps: showNextSteps(state),
    };
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators({
            unhideNextSteps,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(UserGuideDropdown);
