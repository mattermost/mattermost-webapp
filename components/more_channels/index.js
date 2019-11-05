// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {createSelector} from 'reselect';

import {getChannels, getArchivedChannels, joinChannel} from 'mattermost-redux/actions/channels';
import {getOtherChannels, getChannelsInCurrentTeam} from 'mattermost-redux/selectors/entities/channels';
import {getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';
import {RequestStatus} from 'mattermost-redux/constants';

import {getConfig} from 'mattermost-redux/selectors/entities/general';

import {searchMoreChannels} from 'actions/channel_actions.jsx';

import MoreChannels from './more_channels.jsx';

const getNotArchivedOtherChannels = createSelector(
    getOtherChannels,
    (channels) => channels && channels.filter((c) => c.delete_at === 0)
);

const getArchivedOtherChannels = createSelector(
    getChannelsInCurrentTeam,
    (channels) => channels && channels.filter((c) => c.delete_at !== 0)
);

function mapStateToProps(state) {
    const team = getCurrentTeam(state) || {};

    return {
        channels: getNotArchivedOtherChannels(state) || [],
        archivedChannels: getArchivedOtherChannels(state) || [],
        currentUserId: getCurrentUserId(state),
        teamId: team.id,
        teamName: team.name,
        channelsRequestStarted: state.requests.channels.getChannels.status === RequestStatus.STARTED,
        canShowArchivedChannels: (getConfig(state).ExperimentalViewArchivedChannels === 'true'),
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            getChannels,
            getArchivedChannels,
            joinChannel,
            searchMoreChannels,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(MoreChannels);
