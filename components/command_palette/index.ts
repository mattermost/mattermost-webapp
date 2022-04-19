// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch} from 'redux';

import {GenericAction} from 'mattermost-redux/types/actions';

import {GlobalState} from 'types/store';
import {isModalOpen} from 'selectors/views/modals';
import {openModal, closeModal} from 'actions/views/modals';

import {ModalIdentifiers} from 'utils/constants';

import CommandPalette from './command_palette';

function mapStateToProps(state: GlobalState) {
    return {
        isCommandPaletteOpen: isModalOpen(state, ModalIdentifiers.COMMAND_PALETTE),
    };
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators({
            openModal,
            closeModal,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(CommandPalette);
