// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {editCommand, getCustomTeamCommands} from 'mattermost-redux/actions/integrations';
import {getCommands} from 'mattermost-redux/selectors/entities/integrations';

import EditCommand from './edit_command.jsx';

const mapStateToProps = (state, ownProps) => {
    const commandId = (new URLSearchParams(ownProps.location.search)).get('id');

    return {
        commandId,
        commands: getCommands(state)
    };
};

const mapDispatchToProps = (dispatch) => ({
    actions: bindActionCreators({
        getCustomTeamCommands,
        editCommand
    }, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(EditCommand);
