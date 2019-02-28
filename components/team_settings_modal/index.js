// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {ModalIdentifiers} from 'utils/constants';
import {isModalOpen} from 'selectors/views/modals';

import TeamSettingsModal from './team_settings_modal.jsx';

function mapStateToProps(state) {
    const modalId = ModalIdentifiers.TEAM_SETTINGS;
    return {
        show: isModalOpen(state, modalId),
    };
}

export default connect(mapStateToProps)(TeamSettingsModal);
