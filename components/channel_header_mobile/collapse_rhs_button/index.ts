// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {bindActionCreators, Dispatch} from 'redux';
import {connect} from 'react-redux';

import {GenericAction} from 'mattermost-redux/types/actions';

import {toggleMenu as toggleRhsMenu} from 'actions/views/rhs';

import CollapseRhsButton from './collapse_rhs_button';

const mapDispatchToProps = (dispatch:Dispatch<GenericAction>) => ({
    actions: bindActionCreators({
        toggleRhsMenu,
    }, dispatch),
});

export default connect(null, mapDispatchToProps)(CollapseRhsButton);
