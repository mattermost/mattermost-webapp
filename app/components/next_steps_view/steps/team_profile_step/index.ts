// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch} from 'redux';

import {patchTeam, removeTeamIcon, setTeamIcon} from 'mattermost-redux/actions/teams';
import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';

import {GlobalState} from 'types/store';

import TeamProfileStep from './team_profile_step';

function mapStateToProps(state: GlobalState) {
    const config = getConfig(state);

    return {
        team: getCurrentTeam(state),
        siteURL: config.SiteURL!,
        maxFileSize: parseInt(config.MaxFileSize!, 10),
    };
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators({
            patchTeam,
            removeTeamIcon,
            setTeamIcon,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(TeamProfileStep);
