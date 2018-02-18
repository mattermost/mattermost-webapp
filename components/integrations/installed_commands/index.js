// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {deleteCommand, regenCommandToken} from 'mattermost-redux/actions/integrations';
import {haveITeamPerm} from 'mattermost-redux/selectors/entities/roles';
import {Permissions} from 'mattermost-redux/constants';

import InstalledCommands from './installed_commands.jsx';

function mapStateToProps(state, ownProps) {
    const canManageOthersSlashCommands = haveITeamPerm(state, {team: ownProps.team.id, perm: Permissions.MANAGE_OTHERS_SLASH_COMMANDS});

    return {
        canManageOthersSlashCommands
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            regenCommandToken,
            deleteCommand
        }, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(InstalledCommands);
