// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import {getBool} from 'mattermost-redux/selectors/entities/preferences';
import {patchChannel} from 'mattermost-redux/actions/channels';
import {Preferences} from 'mattermost-redux/constants';

import {closeModal} from 'actions/views/modals';

import {isModalOpen} from '../../selectors/views/modals';
import {ModalIdentifiers} from '../../utils/constants';

import EditChannelHeaderModal from './edit_channel_header_modal.jsx';

function mapStateToProps(state) {
    return {
        show: isModalOpen(state, ModalIdentifiers.EDIT_CHANNEL_HEADER),
        ctrlSend: getBool(state, Preferences.CATEGORY_ADVANCED_SETTINGS, 'send_on_ctrl_enter'),
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            closeModal,
            patchChannel,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(EditChannelHeaderModal);
