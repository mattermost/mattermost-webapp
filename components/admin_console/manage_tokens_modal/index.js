// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {getUserAccessTokensForUser} from 'mattermost-redux/actions/users';

import ManageTokensModal from './manage_tokens_modal.jsx';

function mapStateToProps(state, ownProps) {
    const userId = ownProps.user ? ownProps.user.id : '';

    return {
        userAccessTokens: state.entities.admin.userAccessTokensByUser[userId],
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            getUserAccessTokensForUser,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(ManageTokensModal);
