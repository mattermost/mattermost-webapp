// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {connect} from 'react-redux';
import {bindActionCreators, Dispatch} from 'redux';

import {getCurrentUser, getCurrentUserId} from 'mattermost-redux/selectors/entities/users';
import {
    getAutoTourTreatment,
    getInt,
} from 'mattermost-redux/selectors/entities/preferences';
import {savePreferences} from 'mattermost-redux/actions/preferences';
import {setProductMenuSwitcherOpen} from 'actions/views/product_menu';
import {GenericAction} from 'mattermost-redux/types/actions';
import {AutoTourTreatments} from 'mattermost-redux/constants/config';
import {isAdmin} from 'mattermost-redux/utils/user_utils';

import {closeMenu as closeRhsMenu} from 'actions/views/rhs';
import {setFirstChannelName} from 'actions/views/channel_sidebar';

import {getFirstChannelName} from 'selectors/onboarding';

import Constants, {Preferences} from 'utils/constants';
import {GlobalState} from 'types/store';

import TutorialTip from './tutorial_tip';

type OwnProps = {
    tutorialCategory?: string;
    autoTour: boolean;
}

function mapStateToProps(state: GlobalState, ownProps: OwnProps) {
    const currentUserId = getCurrentUserId(state);
    const categoryStep = ownProps.tutorialCategory || Preferences.TUTORIAL_STEP;
    const onBoardingAutoTourStatus = getInt(state, Preferences.TUTORIAL_STEP_AUTO_TOUR_STATUS, currentUserId, Constants.AutoTourStatus.ENABLED) === Constants.AutoTourStatus.ENABLED;

    return {
        currentUserId,
        currentStep: getInt(state, categoryStep, currentUserId, 0),
        autoTour: ownProps.tutorialCategory ? ownProps.autoTour : getAutoTourTreatment(state) === AutoTourTreatments.AUTO && onBoardingAutoTourStatus,
        firstChannelName: getFirstChannelName(state),
        isAdmin: isAdmin(getCurrentUser(state).roles),
    };
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators({
            closeRhsMenu,
            savePreferences,
            setFirstChannelName,
            setProductMenuSwitcherOpen,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(TutorialTip);
