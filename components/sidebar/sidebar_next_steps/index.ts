// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {Dispatch, bindActionCreators} from 'redux';
import {withRouter} from 'react-router-dom';

import {savePreferences} from 'mattermost-redux/actions/preferences';
import {makeGetCategory} from 'mattermost-redux/selectors/entities/preferences';
import {getCurrentUserId, getCurrentUser, isCurrentUserSystemAdmin} from 'mattermost-redux/selectors/entities/users';
import {getConfig} from 'mattermost-redux/selectors/entities/general';

import {getCurrentRelativeTeamUrl} from 'mattermost-redux/selectors/entities/teams';

import {getSteps} from '../../next_steps_view/steps';

import {openModal, closeModal} from 'actions/views/modals';
import {showNextSteps} from 'components/next_steps_view/steps';
import {GlobalState} from 'types/store';
import {Preferences} from 'utils/constants';

import SidebarNextSteps from './sidebar_next_steps';

function makeMapStateToProps() {
    const getCategory = makeGetCategory();

    return (state: GlobalState) => ({
        steps: getSteps(state),
        showNextSteps: showNextSteps(state),
        currentUser: getCurrentUser(state),
        currentUserId: getCurrentUserId(state),
        preferences: getCategory(state, Preferences.RECOMMENDED_NEXT_STEPS),
        isAdmin: isCurrentUserSystemAdmin(state),
        teamUrl: getCurrentRelativeTeamUrl(state),
        enableOnboardingFlow: getConfig(state).EnableOnboardingFlow === 'true',
    });
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators({
            savePreferences,
            openModal,
            closeModal,
        }, dispatch),
    };
}

export default withRouter(connect(makeMapStateToProps, mapDispatchToProps)(SidebarNextSteps));
