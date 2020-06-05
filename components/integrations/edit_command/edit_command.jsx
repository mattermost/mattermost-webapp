// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';

import {browserHistory} from 'utils/browser_history';
import {t} from 'utils/i18n';
import LoadingScreen from 'components/loading_screen';
import ConfirmModal from 'components/confirm_modal';
import AbstractCommand from '../abstract_command.jsx';

const HEADER = {id: t('integrations.edit'), defaultMessage: 'Edit'};
const FOOTER = {id: t('edit_command.update'), defaultMessage: 'Update'};
const LOADING = {id: t('edit_command.updating'), defaultMessage: 'Updating...'};

export default class EditCommand extends React.PureComponent {
    static propTypes = {

        /**
        * The current team
        */
        team: PropTypes.object.isRequired,

        /**
        * The id of the command to edit
        */
        commandId: PropTypes.string.isRequired,

        /**
        * Installed slash commands to display
        */
        commands: PropTypes.object,

        actions: PropTypes.shape({

            /**
            * The function to call to fetch team commands
            */
            getCustomTeamCommands: PropTypes.func.isRequired,

            /**
            * The function to call to edit command
            */
            editCommand: PropTypes.func.isRequired,
        }).isRequired,

        /**
        * Whether or not commands are enabled.
        */
        enableCommands: PropTypes.bool,
    }

    constructor(props) {
        super(props);

        this.state = {
            originalCommand: null,
            showConfirmModal: false,
            serverError: '',
        };
    }

    componentDidMount() {
        if (this.props.enableCommands) {
            this.props.actions.getCustomTeamCommands(this.props.team.id).then(
                () => {
                    this.setState({
                        originalCommand: Object.values(this.props.commands).filter((command) => command.id === this.props.commandId)[0],
                    });
                },
            );
        }
    }

    editCommand = async (command) => {
        this.newCommand = command;

        if (this.state.originalCommand.id) {
            command.id = this.state.originalCommand.id;
        }

        if (this.state.originalCommand.url !== this.newCommand.url ||
            this.state.originalCommand.trigger !== this.newCommand.trigger ||
            this.state.originalCommand.method !== this.newCommand.method) {
            this.handleConfirmModal();
        } else {
            await this.submitCommand();
        }
    }

    handleConfirmModal = () => {
        this.setState({showConfirmModal: true});
    }

    confirmModalDismissed = () => {
        this.setState({showConfirmModal: false});
    }

    submitCommand = async () => {
        this.setState({serverError: ''});

        const {data, error} = await this.props.actions.editCommand(this.newCommand);

        if (data) {
            browserHistory.push(`/${this.props.team.name}/integrations/commands`);
            return;
        }

        this.setState({showConfirmModal: false});

        if (error) {
            this.setState({serverError: error.message});
        }
    }

    renderExtra = () => {
        const confirmButton = (
            <FormattedMessage
                id='update_command.update'
                defaultMessage='Update'
            />
        );

        const confirmTitle = (
            <FormattedMessage
                id='update_command.confirm'
                defaultMessage='Edit Slash Command'
            />
        );

        const confirmMessage = (
            <FormattedMessage
                id='update_command.question'
                defaultMessage='Your changes may break the existing slash command. Are you sure you would like to update it?'
            />
        );

        return (
            <ConfirmModal
                title={confirmTitle}
                message={confirmMessage}
                confirmButtonText={confirmButton}
                show={this.state.showConfirmModal}
                onConfirm={this.submitCommand}
                onCancel={this.confirmModalDismissed}
            />
        );
    }

    render() {
        if (!this.state.originalCommand) {
            return <LoadingScreen/>;
        }

        return (
            <AbstractCommand
                team={this.props.team}
                header={HEADER}
                footer={FOOTER}
                loading={LOADING}
                renderExtra={this.renderExtra()}
                action={this.editCommand}
                serverError={this.state.serverError}
                initialCommand={this.state.originalCommand}
            />
        );
    }
}
