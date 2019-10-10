// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {updateActiveSection} from 'actions/views/settings';
import {ModalIdentifiers} from 'utils/constants';
import {isModalOpen} from 'selectors/views/modals';

import TeamSettingsModal from './team_settings_modal.jsx';

function mapStateToProps(state) {
    const modalId = ModalIdentifiers.TEAM_SETTINGS;
    return {
        show: isModalOpen(state, modalId),
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            updateActiveSection,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(TeamSettingsModal);
