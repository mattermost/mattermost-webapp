// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';
import {get} from 'mattermost-redux/selectors/entities/preferences';

import {showMentions, showFlaggedPosts, closeRightHandSide} from 'actions/views/rhs';
import {getRhsState} from 'selectors/rhs';
import {RHSStates, Preferences, TutorialSteps} from 'utils/constants.jsx';
import {isMobile} from 'utils/utils.jsx';

import SidebarRightMenu from './sidebar_right_menu.jsx';

function mapStateToProps(state) {
    const config = getConfig(state);
    const rhsState = getRhsState(state);

    const enableTutorial = config.EnableTutorial === 'true';
    const tutorialStep = parseInt(get(state, Preferences.TUTORIAL_STEP, getCurrentUserId(state), TutorialSteps.FINISHED), 10);

    return {
        isMentionSearch: rhsState === RHSStates.MENTION,
        showTutorialTip: enableTutorial && isMobile() && tutorialStep === TutorialSteps.MENU_POPOVER
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            showMentions,
            showFlaggedPosts,
            closeRightHandSide
        }, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(SidebarRightMenu);
