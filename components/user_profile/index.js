// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {getUser, makeGetDisplayName} from 'mattermost-redux/selectors/entities/users';

import UserProfile from './user_profile';

function makeMapStateToProps() {
    const getDisplayName = makeGetDisplayName();

    return (state, ownProps) => {
        return {
            displayName: getDisplayName(state, ownProps.userId),
            user: getUser(state, ownProps.userId),
        };
    };
}

export default connect(makeMapStateToProps)(UserProfile);
