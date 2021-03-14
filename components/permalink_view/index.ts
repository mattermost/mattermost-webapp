// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import { connect } from 'react-redux';
import { bindActionCreators, Dispatch} from 'redux';

import { getCurrentChannel } from 'mattermost-redux/selectors/entities/channels';
import { getCurrentTeam } from 'mattermost-redux/selectors/entities/teams';
import { getCurrentUserId } from 'mattermost-redux/selectors/entities/users';

import { focusPost } from './actions';
import PermalinkView from './permalink_view';
import {GlobalState} from 'mattermost-redux/types/store'
import {GenericAction} from 'mattermost-redux/types/actions'

function mapStateToProps(state: GlobalState) {
    const team = getCurrentTeam(state);
    const channel = getCurrentChannel(state);
    const currentUserId = getCurrentUserId(state);
    const channelId = channel ? channel.id : '';
    const teamName = team ? team.name : '';

    return {
        channelId,
        teamName,
        currentUserId,
    };
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators({
            focusPost,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(PermalinkView);
