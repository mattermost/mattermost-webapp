// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators, Dispatch, ActionCreatorsMapObject} from 'redux';

import {editCommand, getCustomTeamCommands} from 'mattermost-redux/actions/integrations';
import {getCommands} from 'mattermost-redux/selectors/entities/integrations';
import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {GlobalState} from 'mattermost-redux/types/store';
import {GenericAction, ActionFunc} from 'mattermost-redux/types/actions';
import {Command} from 'mattermost-redux/types/integrations';

import EditCommand from './edit_command';

type Props = {
    location: Location;
}

type Actions = {
    getCustomTeamCommands: (teamId: string) => Promise<Command[]>;
    editCommand: (command?: Command) => Promise<{data?: Command; error?: Error}>;
}

function mapStateToProps(state: GlobalState, ownProps: Props) {
    const config = getConfig(state);
    const commandId = (new URLSearchParams(ownProps.location.search)).get('id');
    const enableCommands = config.EnableCommands === 'true';

    return {
        commandId,
        commands: getCommands(state),
        enableCommands,
    };
}

function mapDispatchToProps(dispatch: Dispatch<GenericAction>) {
    return {
        actions: bindActionCreators<ActionCreatorsMapObject<ActionFunc>, Actions>({
            getCustomTeamCommands,
            editCommand,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(EditCommand);
