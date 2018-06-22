// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {getMissingProfilesByIds, getMissingProfilesByUsernames} from 'mattermost-redux/actions/users';
import {Preferences} from 'mattermost-redux/constants';
import {getBool, getTeammateNameDisplaySetting} from 'mattermost-redux/selectors/entities/preferences';
import {getCurrentUser, makeGetProfilesByIdsAndUsernames} from 'mattermost-redux/selectors/entities/users';

import CombinedSystemMessage from './combined_system_message.jsx';

function makeMapStateToProps() {
    const getProfilesByIdsAndUsernames = makeGetProfilesByIdsAndUsernames();

    return (state, ownProps) => {
        const currentUser = getCurrentUser(state);
        const {allUserIds, allUsernames} = ownProps;

        return {
            currentUserId: currentUser.id,
            currentUsername: currentUser.username,
            showJoinLeave: getBool(state, Preferences.CATEGORY_ADVANCED_SETTINGS, Preferences.ADVANCED_FILTER_JOIN_LEAVE, true),
            teammateNameDisplay: getTeammateNameDisplaySetting(state),
            userProfiles: getProfilesByIdsAndUsernames(state, {allUserIds, allUsernames}),
        };
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            getMissingProfilesByIds,
            getMissingProfilesByUsernames,
        }, dispatch),
    };
}

export default connect(makeMapStateToProps, mapDispatchToProps)(CombinedSystemMessage);
