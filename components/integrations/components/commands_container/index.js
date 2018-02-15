// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {getCustomTeamCommands} from 'mattermost-redux/actions/integrations';
import {getCommands} from 'mattermost-redux/selectors/entities/integrations';
import {getUsers} from 'mattermost-redux/selectors/entities/users';

import CommandsContainer from './commands_container.jsx';

const mapStateToProps = (state) => ({
    commands: Object.values(getCommands(state)),
    users: getUsers(state)
});

const mapDispatchToProps = (dispatch) => ({
    actions: bindActionCreators({
        getCustomTeamCommands
    }, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(CommandsContainer);
