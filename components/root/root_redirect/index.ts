// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';

import {GlobalState} from 'types/store';

import RootRedirect from './root_redirect';

function mapStateToProps(state: GlobalState) {
    return {
        currentUserId: getCurrentUserId(state),
    };
}

export default connect(mapStateToProps)(RootRedirect);
