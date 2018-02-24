// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {createSelector} from 'reselect';
import {updateChannel as UpdateChannel} from 'mattermost-redux/actions/channels';
import {getTeam} from 'mattermost-redux/selectors/entities/teams';

import {getSiteURL} from 'utils/url.jsx';

import RenameChannelModal from './rename_channel_modal.jsx';

const mapStateToProps = createSelector(
    (state) => {
        const currentTeamId = state.entities.teams.currentTeamId;
        const team = getTeam(state, currentTeamId);
        const currentTeamUrl = `${getSiteURL()}/${team.name}`;
        return {
            currentTeamUrl,
            team,
        };
    },
    (teamInfo) => ({...teamInfo})
);

function mapDispatchToProps(dispatch) {
    return {
        actions: {
            updateChannel: bindActionCreators(UpdateChannel, dispatch),
        },
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(RenameChannelModal);
