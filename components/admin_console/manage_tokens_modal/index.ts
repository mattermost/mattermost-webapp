// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch} from 'redux';
import {getUserAccessTokensForUser} from 'mattermost-redux/actions/users';
import {UserProfile} from 'mattermost-redux/types/users';

import {GlobalState} from 'types/store';

import {AdminTokenState} from './types/admin';

import ManageTokensModal from './manage_tokens_modal';

type Props = {
    user?: UserProfile;
}

function mapStateToProps(state: GlobalState, ownProps: Props) {
    const userId = ownProps.user ? ownProps.user.id : '';

    const userAccessTokens = (state.entities.admin as AdminTokenState).userAccessTokensByUser;

    return {
        userAccessTokens: userAccessTokens === undefined ? undefined : userAccessTokens[userId],
    };
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators({
            getUserAccessTokensForUser,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(ManageTokensModal);
