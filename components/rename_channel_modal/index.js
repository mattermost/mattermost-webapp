// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {createSelector} from 'reselect';
import {updateChannel as UpdateChannel} from 'mattermost-redux/actions/channels';

import {getCurrentTeamUrl, getTeam} from 'mattermost-redux/selectors/entities/teams';

import RenameChannelModal from './rename_channel_modal.jsx';

const mapStateToProps = createSelector(
    (state) => {
        const currentTeamId = state.entities.teams.currentTeamId;
        return {
            currentTeamUrl: getCurrentTeamUrl(state),
            team: getTeam(state, currentTeamId)
        };
    },
    (teamInfo) => ({...teamInfo})
);

function mapDispatchToProps(dispatch) {
    return {
        actions: {
            updateChannel: bindActionCreators(UpdateChannel, dispatch)
        }
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(RenameChannelModal);
