// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {getInt} from 'mattermost-redux/selectors/entities/preferences';

import {Preferences, TutorialSteps} from 'utils/constants.jsx';
import * as Utils from 'utils/utils.jsx';

import SidebarHeader from './sidebar_header.jsx';

function mapStateToProps(state, ownProps) {
    const config = getConfig(state);

    const enableTutorial = config.EnableTutorial === 'true';

    const showTutorialTip = getInt(state, Preferences.TUTORIAL_STEP, ownProps.currentUser.id) === TutorialSteps.MENU_POPOVER && !Utils.isMobile();

    return {
        enableTutorial,
        showTutorialTip,
    };
}

export default connect(mapStateToProps)(SidebarHeader);
