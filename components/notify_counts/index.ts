// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {getUnreadsInCurrentTeam} from 'mattermost-redux/selectors/entities/channels';
import {GlobalState} from 'mattermost-redux/types/store';

import NotifyCounts from './notify_counts';

function mapStateToProps(state: GlobalState) {
    const {mentionCount, messageCount} = getUnreadsInCurrentTeam(state);
    return {
        mentionCount,
        messageCount,
    };
}

export default connect(mapStateToProps)(NotifyCounts);
