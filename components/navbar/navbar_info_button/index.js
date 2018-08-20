// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {openModal} from 'actions/views/modals';

import NavbarInfoButton from './navbar_info_button.jsx';

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            openModal,
        }, dispatch),
    };
}

export default connect(null, mapDispatchToProps)(NavbarInfoButton);
