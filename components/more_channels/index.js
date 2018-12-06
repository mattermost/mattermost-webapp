// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {createSelector} from 'reselect';

import {getChannels, joinChannel} from 'mattermost-redux/actions/channels';
import {getOtherChannels} from 'mattermost-redux/selectors/entities/channels';
import {getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';
import {RequestStatus} from 'mattermost-redux/constants';

import {searchMoreChannels} from 'actions/channel_actions.jsx';

import MoreChannels from './more_channels.jsx';

const getNotArchivedOtherChannels = createSelector(
    getOtherChannels,
    (channels) => channels && channels.filter((c) => c.delete_at === 0)
);

function mapStateToProps(state) {
    const team = getCurrentTeam(state) || {};

    return {
        channels: getNotArchivedOtherChannels(state) || [],
        currentUserId: getCurrentUserId(state),
        teamId: team.id,
        teamName: team.name,
        channelsRequestStarted: state.requests.channels.getChannels.status === RequestStatus.STARTED,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            getChannels,
            joinChannel,
            searchMoreChannels,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(MoreChannels);
