// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {Dispatch, bindActionCreators} from 'redux';

import {savePreferences} from 'mattermost-redux/actions/preferences';
import {makeGetCategory} from 'mattermost-redux/selectors/entities/preferences';
import {getCurrentUserId, getCurrentUser, isCurrentUserSystemAdmin} from 'mattermost-redux/selectors/entities/users';

import {getSteps} from '../../cloud_onboarding/steps';

import {openModal, closeModal} from 'actions/views/modals';
import {setShowNextStepsView} from 'actions/views/next_steps';
import {showNextSteps} from 'components/cloud_onboarding/steps';
import {GlobalState} from 'types/store';
import {Preferences} from 'utils/constants';

import SidebarNextSteps from './sidebar_next_steps';

function makeMapStateToProps() {
    const getCategory = makeGetCategory();

    return (state: GlobalState) => ({
        active: state.views.nextSteps.show,
        steps: getSteps(state),
        showNextSteps: showNextSteps(state),
        currentUser: getCurrentUser(state),
        currentUserId: getCurrentUserId(state),
        preferences: getCategory(state, Preferences.RECOMMENDED_NEXT_STEPS),
        isAdmin: isCurrentUserSystemAdmin(state),
    });
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators({
            savePreferences,
            openModal,
            closeModal,
            setShowNextStepsView,
        }, dispatch),
    };
}

export default connect(makeMapStateToProps, mapDispatchToProps)(SidebarNextSteps);
