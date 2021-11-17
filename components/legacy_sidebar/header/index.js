// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {getIsMobileView} from 'selectors/views/browser';

import {getConfig, getFirstAdminVisitMarketplaceStatus} from 'mattermost-redux/selectors/entities/general';
import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';
import {getInt} from 'mattermost-redux/selectors/entities/preferences';

import {Preferences, TutorialSteps} from 'utils/constants';

import SidebarHeader from './sidebar_header.jsx';

function mapStateToProps(state) {
    const config = getConfig(state);
    const currentUser = getCurrentUser(state);

    const enableTutorial = config.EnableTutorial === 'true';

    const isMobile = getIsMobileView(state);
    const showTutorialTip = getInt(state, Preferences.TUTORIAL_STEP, currentUser.id) === TutorialSteps.MENU_POPOVER && !isMobile;

    const firstAdminVisitMarketplaceStatus = getFirstAdminVisitMarketplaceStatus(state);

    return {
        enableTutorial,
        showTutorialTip,
        firstAdminVisitMarketplaceStatus,
    };
}

export default connect(mapStateToProps)(SidebarHeader);
