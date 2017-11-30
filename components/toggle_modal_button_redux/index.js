// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import ModalToggleButtonRedux from './toggle_modal_button_redux.jsx';

import {openModal} from 'actions/views/modals';

function mapStateToProps(state, ownProps) {
    return {
        ...ownProps
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            openModal
        }, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(ModalToggleButtonRedux);