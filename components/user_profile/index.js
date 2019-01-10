// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {getUser, makeGetDisplayName} from 'mattermost-redux/selectors/entities/users';

import UserProfile from './user_profile';

function makeMapStateToProps(initialState, initialProps) {
    const getDisplayName = makeGetDisplayName();
    const userId = initialProps.userId;

    return (state) => {
        return {
            displayName: getDisplayName(state, userId),
            user: getUser(state, userId),
        };
    };
}

export default connect(makeMapStateToProps)(UserProfile);
