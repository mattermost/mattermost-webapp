// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {connect} from 'react-redux';
import {bindActionCreators, Dispatch} from 'redux';

import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';
import {
    getAutoTourTreatment,
    getInt,
    makeGetCategory,
} from 'mattermost-redux/selectors/entities/preferences';
import {savePreferences} from 'mattermost-redux/actions/preferences';
import {GenericAction} from 'mattermost-redux/types/actions';
import {PreferenceType} from 'mattermost-redux/types/preferences';
import {AutoTourTreatments} from 'mattermost-redux/constants/config';

import {closeMenu as closeRhsMenu} from 'actions/views/rhs';
import {setFirstChannelName} from 'actions/views/channel_sidebar';

import {Preferences, RecommendedNextSteps} from 'utils/constants';
import {GlobalState} from 'types/store';

import TutorialTip from './tutorial_tip';

type OwnProps = {
    tutorialCategory?: string;
    autoTour: boolean;
}

function mapStateToProps(state: GlobalState, ownProps: OwnProps) {
    const currentUserId = getCurrentUserId(state);
    const categoryStep = ownProps.tutorialCategory || Preferences.TUTORIAL_STEP;
    const getCategory = makeGetCategory();
    const preferences = getCategory(state, Preferences.AB_TEST_PREFERENCE_VALUE);
    const firstChannelNameFromPref = preferences.find((pref: PreferenceType) => pref.name === RecommendedNextSteps.CREATE_FIRST_CHANNEL);
    const firstChannelNameFromRedux = state.views.channelSidebar.firstChannelName;
    return {
        currentUserId,
        currentStep: getInt(state, categoryStep, currentUserId, 0),
        autoTour: ownProps.tutorialCategory ? ownProps.autoTour : getAutoTourTreatment(state) === AutoTourTreatments.AUTO,
        firstChannelName: (firstChannelNameFromRedux || firstChannelNameFromPref?.value) || '',
    };
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators({
            closeRhsMenu,
            savePreferences,
            setFirstChannelName,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(TutorialTip);
