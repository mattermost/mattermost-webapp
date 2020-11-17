// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import {browserHistory} from 'utils/browser_history';
import {t} from 'utils/i18n';
import AbstractCommand from '../abstract_command.jsx';

const HEADER = {id: t('integrations.add'), defaultMessage: 'Add'};
const FOOTER = {id: t('add_command.save'), defaultMessage: 'Save'};
const LOADING = {id: t('add_command.saving'), defaultMessage: 'Saving...'};

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
            addCommand: PropTypes.func.isRequired,
        }).isRequired,
    }

    constructor(props) {
        super(props);

        this.state = {
            serverError: '',
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
                loading={LOADING}
                renderExtra={''}
                action={this.addCommand}
                serverError={this.state.serverError}
            />
        );
    }
}
