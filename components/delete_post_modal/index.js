// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {deletePost} from 'mattermost-redux/actions/posts';
import {getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';

import DeletePostModal from './delete_post_modal.jsx';

function mapStateToProps(state, ownProps) {
    return {
        ...ownProps,
        currentTeamDetails: getCurrentTeam(state),
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            deletePost,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(DeletePostModal);
