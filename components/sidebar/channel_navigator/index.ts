// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch, ActionCreatorsMapObject} from 'redux';

import {ActionFunc} from 'mattermost-redux/types/actions';
import {getChannelsNameMapInCurrentTeam} from 'mattermost-redux/selectors/entities/channels';
import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {getInt, shouldShowUnreadsCategory, getAddChannelButtonTreatment} from 'mattermost-redux/selectors/entities/preferences';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';

import {openModal, closeModal} from 'actions/views/modals';
import {browserHistory} from 'utils/browser_history';
import {Constants, ModalIdentifiers, Preferences, TutorialSteps} from 'utils/constants';
import {getGlobalHeaderEnabled} from 'selectors/global_header';
import {isModalOpen} from 'selectors/views/modals';
import {GlobalState} from 'types/store';

import ChannelNavigator from './channel_navigator';

// TODO: For Phase 1. Will revisit history in Phase 2
function goBack() {
    return () => {
        browserHistory.goBack();
        return {data: null};
    };
}

function goForward() {
    return () => {
        browserHistory.goForward();
        return {data: null};
    };
}

function mapStateToProps(state: GlobalState) {
    const config = getConfig(state);
    const channelsByName = getChannelsNameMapInCurrentTeam(state);
    const enableTutorial = config.EnableTutorial === 'true';
    const tutorialStep = getInt(state, Preferences.TUTORIAL_STEP, getCurrentUserId(state), TutorialSteps.FINISHED);

    return {
        townSquareDisplayName: channelsByName[Constants.DEFAULT_CHANNEL]?.display_name || '',
        offTopicDisplayName: channelsByName[Constants.OFFTOPIC_CHANNEL]?.display_name || '',
        showTutorialTip: enableTutorial && tutorialStep === TutorialSteps.ADD_CHANNEL_POPOVER,
        canGoBack: true, // TODO: Phase 1 only
        canGoForward: true,
        showUnreadsCategory: shouldShowUnreadsCategory(state),
        globalHeaderEnabled: getGlobalHeaderEnabled(state),
        addChannelButton: getAddChannelButtonTreatment(state),
        isQuickSwitcherOpen: isModalOpen(state, ModalIdentifiers.QUICK_SWITCH),
    };
}

type Actions = {
    openModal: (modalData: any) => Promise<{data: boolean}>;
    closeModal: (modalId: string) => void;
    goBack: () => void;
    goForward: () => void;
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<ActionFunc>, Actions>({
            openModal,
            closeModal,
            goBack,
            goForward,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(ChannelNavigator);
