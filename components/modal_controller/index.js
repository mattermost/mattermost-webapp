// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {closeModal} from 'actions/views/modals';

import ModalController from './modal_controller.jsx';

function mapStateToProps(state, ownProps) {
    return {
        ...ownProps,
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
