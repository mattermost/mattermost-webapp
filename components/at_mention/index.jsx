// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {getTeammateNameDisplaySetting} from 'mattermost-redux/selectors/entities/preferences';
import {getCurrentUserId, getUsersByUsername} from 'mattermost-redux/selectors/entities/users';
import {getAssociatedGroupsByName} from 'mattermost-redux/selectors/entities/groups';
import {getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';
import {getCurrentChannelId} from 'mattermost-redux/selectors/entities/channels';

import {getSelectedChannelId} from 'selectors/rhs';

import AtMention from './at_mention.jsx';

function mapStateToProps(state, props) {
    return {
        currentUserId: getCurrentUserId(state),
        teammateNameDisplay: getTeammateNameDisplaySetting(state),
        usersByUsername: getUsersByUsername(state),
        groupsByName: getAssociatedGroupsByName(state, getCurrentTeamId(state), props.isRHS ? getSelectedChannelId(state) : getCurrentChannelId(state)),
    };
}

export default connect(mapStateToProps)(AtMention);
