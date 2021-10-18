// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch} from 'redux';

import {savePreferences} from 'mattermost-redux/actions/preferences';
import {getProfiles} from 'mattermost-redux/actions/users';
import {makeGetCategory, getDownloadAppsCTATreatment} from 'mattermost-redux/selectors/entities/preferences';
import {getCurrentUser, isCurrentUserSystemAdmin} from 'mattermost-redux/selectors/entities/users';
import {getTeam, getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';
import {getLicense} from 'mattermost-redux/selectors/entities/general';
import {DownloadAppsCTATreatments} from 'mattermost-redux/constants/config';

import {setShowNextStepsView} from 'actions/views/next_steps';
import {closeRightHandSide} from 'actions/views/rhs';
import {GlobalState} from 'types/store';
import {Preferences} from 'utils/constants';

import {getSteps, isFirstAdmin} from './steps';
import NextStepsView from './next_steps_view';

function makeMapStateToProps() {
    const getCategory = makeGetCategory();

    return (state: GlobalState) => {
        const teamId = getCurrentTeamId(state);
        const team = getTeam(state, teamId || '');
        const downloadAppsAsNextStep = getDownloadAppsCTATreatment(state) === DownloadAppsCTATreatments.TIPS_AND_NEXT_STEPS;
        return {
            currentUser: getCurrentUser(state),
            isAdmin: isCurrentUserSystemAdmin(state),
            preferences: getCategory(state, Preferences.RECOMMENDED_NEXT_STEPS),
            steps: getSteps(state),
            isFirstAdmin: isFirstAdmin(state),
            team,
            isCloud: getLicense(state).Cloud === 'true',
            downloadAppsAsNextStep,
        };
    };
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators(
            {
                savePreferences,
                setShowNextStepsView,
                getProfiles,
                closeRightHandSide,
            },
            dispatch,
        ),
    };
}

export default connect(makeMapStateToProps, mapDispatchToProps)(NextStepsView);
