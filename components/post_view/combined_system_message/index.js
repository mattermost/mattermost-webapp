// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {getProfilesByIds, getProfilesByUsernames} from 'mattermost-redux/actions/users';

import {getTeammateNameDisplaySetting} from 'mattermost-redux/selectors/entities/preferences';
import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';

import CombinedSystemMessage from './combined_system_message.jsx';

function mapStateToProps(state) {
    const currentUser = getCurrentUser(state);
    return {
        currentUserId: currentUser.id,
        currentUsername: currentUser.username,
        teammateNameDisplay: getTeammateNameDisplaySetting(state),
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            getProfilesByIds,
            getProfilesByUsernames,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(CombinedSystemMessage);
