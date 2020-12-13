// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {getUser, makeGetDisplayName} from 'mattermost-redux/selectors/entities/users';

import {GlobalState} from 'mattermost-redux/types/store';

import UserProfile, {UserProfileProps} from './user_profile';

function makeMapStateToProps() {
    const getDisplayName = makeGetDisplayName();

    return (state: GlobalState, ownProps: UserProfileProps) => {
        return {
            displayName: getDisplayName(state, ownProps.userId, true),
            user: getUser(state, ownProps.userId),
        };
    };
}

export default connect(makeMapStateToProps)(UserProfile);
