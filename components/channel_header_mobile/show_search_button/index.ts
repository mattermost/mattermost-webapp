// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {bindActionCreators, Dispatch} from 'redux';
import {connect} from 'react-redux';

import {GenericAction} from 'mattermost-redux/types/actions';

import {openRHSSearch} from 'actions/views/rhs';

import ShowSearchButton from './show_search_button';

const mapDispatchToProps = (dispatch: Dispatch<GenericAction>) => ({
    actions: bindActionCreators({
        openRHSSearch,
    }, dispatch),
});

export default connect(null, mapDispatchToProps)(ShowSearchButton);
