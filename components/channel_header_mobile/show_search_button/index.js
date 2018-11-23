// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import {updateRhsState} from 'actions/views/rhs';

import ShowSearchButton from './show_search_button';

const mapDispatchToProps = (dispatch) => ({
    actions: bindActionCreators({
        updateRhsState,
    }, dispatch),
});

export default connect(null, mapDispatchToProps)(ShowSearchButton);
