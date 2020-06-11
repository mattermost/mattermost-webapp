// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch} from 'redux';

import {savePreferences} from 'mattermost-redux/actions/preferences';
import {Preferences} from 'mattermost-redux/constants';
import {get as getPreference, getNewSidebarPreference} from 'mattermost-redux/selectors/entities/preferences';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';

import {GlobalState} from 'types/store';
import Constants from 'utils/constants';

import SidebarWhatsNewModal from './sidebar_whats_new_modal';

function mapStateToProps(state: GlobalState) {
    const currentUserId = getCurrentUserId(state);
    const hasSeenModal = getPreference(
        state,
        Constants.Preferences.CATEGORY_SIDEBAR_SETTINGS,
        Preferences.HAS_SEEN_WHATS_NEW_MODAL,
        'false',
    ) === 'true';

    return {
        currentUserId,
        hasSeenModal,
        newSidebarPreference: getNewSidebarPreference(state),
    };
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators({
            savePreferences,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(SidebarWhatsNewModal);
