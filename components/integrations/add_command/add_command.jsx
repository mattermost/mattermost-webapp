// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import {browserHistory} from 'utils/browser_history';
import AbstractCommand from '../abstract_command.jsx';

const HEADER = {id: 'integrations.add', defaultMessage: 'Add'};
const FOOTER = {id: 'add_command.save', defaultMessage: 'Save'};

export default class AddCommand extends React.PureComponent {
    static propTypes = {

        /**
        * The team data
        */
        team: PropTypes.object,

        actions: PropTypes.shape({

            /**
            * The function to call to add new command
            */
            addCommand: PropTypes.func.isRequired
        }).isRequired
    }

    constructor(props) {
        super(props);

        this.state = {
            serverError: ''
        };
    }

    addCommand = async (command) => {
        this.setState({serverError: ''});

        const {data, error} = await this.props.actions.addCommand(command);
        if (data) {
            browserHistory.push(`/${this.props.team.name}/integrations/commands/confirm?type=commands&id=${data.id}`);
            return;
        }

        if (error) {
            this.setState({serverError: error.message});
        }
    }

    render() {
        return (
            <AbstractCommand
                team={this.props.team}
                header={HEADER}
                footer={FOOTER}
                renderExtra={''}
                action={this.addCommand}
                serverError={this.state.serverError}
            />
        );
    }
}
