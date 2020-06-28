// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch} from 'redux';

import {closeModal} from 'actions/views/modals';

import ModalController from './modal_controller';
import { GlobalState } from 'types/store';
import {GenericAction} from 'mattermost-redux/types/actions';

function mapStateToProps(state: GlobalState) {
    return {
        modals: state.views.modals,
    };
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators({
            closeModal,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(ModalController);
