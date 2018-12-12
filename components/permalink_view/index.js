// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {getCurrentChannel} from 'mattermost-redux/selectors/entities/channels';
import {getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';

import {focusPost} from './actions';
import PermalinkView from './permalink_view.jsx';

function mapStateToProps(state) {
    const team = getCurrentTeam(state);
    const channel = getCurrentChannel(state);
    let channelId = '';
    let channelName = '';
    let channelIsArchived;
    if (channel) {
        channelId = channel.id;
        channelName = channel.name;
        channelIsArchived = channel.delete_at !== 0;
    }

    let teamName = '';
    if (team) {
        teamName = team.name;
    }

    return {
        channelId,
        channelName,
        teamName,
        channelIsArchived,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            focusPost,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(PermalinkView);
