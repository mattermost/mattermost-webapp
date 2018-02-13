// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {getUserAccessTokensForUser} from 'mattermost-redux/actions/users';

import ManageTokensModal from './manage_tokens_modal.jsx';

const mapStateToProps = (state, ownProps) => {
    const userId = ownProps.user ? ownProps.user.id : '';

    return {
        userAccessTokens: state.entities.admin.userAccessTokens[userId]
    };
}

const mapDispatchToProps = (dispatch) => ({
    actions: bindActionCreators({
        getUserAccessTokensForUser
    }, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(ManageTokensModal);
