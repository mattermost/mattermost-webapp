// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {isModalOpen} from 'selectors/views/modals';
import {ModalIdentifiers} from 'utils/constants';

import ShortcutsModal from './shortcuts_modal.jsx';

function mapStateToProps(state) {
    const modalId = ModalIdentifiers.SHORTCUTS;
    const show = isModalOpen(state, modalId);
    return {
        show,
    };
}

export default connect(mapStateToProps)(ShortcutsModal);

