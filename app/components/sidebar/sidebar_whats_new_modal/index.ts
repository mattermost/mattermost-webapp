// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch} from 'redux';

import {savePreferences} from 'mattermost-redux/actions/preferences';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';

import {closeModal} from 'actions/views/modals';
import {GlobalState} from 'types/store';

import SidebarWhatsNewModal from './sidebar_whats_new_modal';

function mapStateToProps(state: GlobalState) {
    const currentUserId = getCurrentUserId(state);

    return {
        currentUserId,
    };
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators({
            savePreferences,
            closeModal,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(SidebarWhatsNewModal);
