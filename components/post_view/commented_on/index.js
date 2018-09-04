// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {getUser} from 'mattermost-redux/selectors/entities/users';

import {showSearchResults, updateSearchTerms} from 'actions/views/rhs';

import {getDisplayNameByUser} from 'utils/utils.jsx';

import CommentedOn from './commented_on.jsx';

function mapStateToProps(state, ownProps) {
    let displayName = '';
    if (ownProps.post) {
        const user = getUser(state, ownProps.post.user_id);
        displayName = getDisplayNameByUser(user);
    }

    const config = getConfig(state);
    const enablePostUsernameOverride = config.EnablePostUsernameOverride === 'true';

    return {
        displayName,
        enablePostUsernameOverride,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            showSearchResults,
            updateSearchTerms,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(CommentedOn);
