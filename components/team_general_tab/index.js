// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {updateTeam, removeTeamIcon, setTeamIcon} from 'mattermost-redux/actions/teams';

import TeamGeneralTab from './team_general_tab.jsx';

function mapStateToProps(state, ownProps) {
    const config = getConfig(state);
    const maxFileSize = parseInt(config.MaxFileSize, 10);

    return {
        ...ownProps,
        maxFileSize,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            updateTeam,
            removeTeamIcon,
            setTeamIcon,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(TeamGeneralTab);
