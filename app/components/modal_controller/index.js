// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {closeModal} from 'actions/views/modals';

import ModalController from './modal_controller.jsx';

function mapStateToProps(state) {
    return {
        modals: state.views.modals,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            closeModal,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(ModalController);
