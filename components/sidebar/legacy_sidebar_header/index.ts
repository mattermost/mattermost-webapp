// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch} from 'redux';

import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';
import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';
import {getInt} from 'mattermost-redux/selectors/entities/preferences';
import {GenericAction} from 'mattermost-redux/types/actions';

import {GlobalState} from 'types/store';
import {Preferences, TutorialSteps} from 'utils/constants';
import * as Utils from 'utils/utils.jsx';

import {openModal} from 'actions/views/modals';

import LegacySidebarHeader from './legacy_sidebar_header';

function mapStateToProps(state: GlobalState) {
    const config = getConfig(state);
    const currentTeam = getCurrentTeam(state);
    const currentUser = getCurrentUser(state);

    const enableTutorial = config.EnableTutorial === 'true';

    const showTutorialTip = getInt(state, Preferences.TUTORIAL_STEP, currentUser.id) === TutorialSteps.MENU_POPOVER && !Utils.isMobile();

    return {
        enableTutorial,
        showTutorialTip,
        teamDescription: currentTeam.description,
        teamDisplayName: currentTeam.display_name,
        teamId: currentTeam.id,
    };
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators({
            openModal,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(LegacySidebarHeader);
