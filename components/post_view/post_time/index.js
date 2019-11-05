// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {getCurrentRelativeTeamUrl} from 'mattermost-redux/selectors/entities/teams';

import {closeRightHandSide} from 'actions/views/rhs';

import PostTime from './post_time.jsx';

function mapStateToProps(state) {
    return {
        teamUrl: getCurrentRelativeTeamUrl(state),
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            closeRightHandSide,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(PostTime);
