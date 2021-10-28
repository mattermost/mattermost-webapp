// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';
import {Link} from 'react-router-dom';

<<<<<<< HEAD:components/integrations/installed_command.tsx
import CopyText from 'components/copy_text';

import { Team } from 'mattermost-redux/types/teams';
import {Command} from 'mattermost-redux/types/integrations';
import {UserProfile} from 'mattermost-redux/types/users';
import DeleteIntegrationLink from './delete_integration_link/delete_integration_link';

=======
import CopyText from '../copy_text';

import {Team} from 'mattermost-redux/types/teams';
import {Command} from 'mattermost-redux/types/integrations';
import {UserProfile} from 'mattermost-redux/types/users';

import DeleteIntegration from './delete_integration';
>>>>>>> 23de6f93b5b3b784f78e6e98fbf092e80531bbc2:components/integrations/installed_command.jsx

type Props = {

    /**
    * The team data
    */
<<<<<<< HEAD:components/integrations/installed_command.tsx
    team: Team,
=======
    team: Team;
>>>>>>> 23de6f93b5b3b784f78e6e98fbf092e80531bbc2:components/integrations/installed_command.jsx

    /**
    * Installed slash command to display
    */
<<<<<<< HEAD:components/integrations/installed_command.tsx
    command: Command,
=======
    command: Command;
>>>>>>> 23de6f93b5b3b784f78e6e98fbf092e80531bbc2:components/integrations/installed_command.jsx

    /**
    * The function to call when Regenerate Token link is clicked
    */
<<<<<<< HEAD:components/integrations/installed_command.tsx
    onRegenToken: (command : Command) => void,
=======
    onRegenToken: (command: Command) => void;
>>>>>>> 23de6f93b5b3b784f78e6e98fbf092e80531bbc2:components/integrations/installed_command.jsx

    /**
    * The function to call when Delete link is clicked
    */
<<<<<<< HEAD:components/integrations/installed_command.tsx
    onDelete: (command : Command) => void,
=======
    onDelete: (command: Command) => void;
>>>>>>> 23de6f93b5b3b784f78e6e98fbf092e80531bbc2:components/integrations/installed_command.jsx

    /**
    * Set to filter command, comes from BackstageList
    */
<<<<<<< HEAD:components/integrations/installed_command.tsx
    filter?: string,
=======
    filter?: string;
>>>>>>> 23de6f93b5b3b784f78e6e98fbf092e80531bbc2:components/integrations/installed_command.jsx

    /**
    * The creator user data
    */
<<<<<<< HEAD:components/integrations/installed_command.tsx
    creator: UserProfile,
=======
    creator: UserProfile;
>>>>>>> 23de6f93b5b3b784f78e6e98fbf092e80531bbc2:components/integrations/installed_command.jsx

    /**
    * Set to show edit link
    */
<<<<<<< HEAD:components/integrations/installed_command.tsx
    canChange: boolean,
}

export function matchesFilter(command : Command, filter : string) {
=======
    canChange: boolean;
}

export function matchesFilter(command: Command, filter: string) {
>>>>>>> 23de6f93b5b3b784f78e6e98fbf092e80531bbc2:components/integrations/installed_command.jsx
    if (!filter) {
        return true;
    }

    return command.display_name.toLowerCase().indexOf(filter) !== -1 ||
        command.description.toLowerCase().indexOf(filter) !== -1 ||
        command.trigger.toLowerCase().indexOf(filter) !== -1;
}

export default class InstalledCommand extends React.PureComponent<Props> {
<<<<<<< HEAD:components/integrations/installed_command.tsx


    handleRegenToken = (e: { preventDefault: () => void; }) => {
=======
    handleRegenToken = (e: { preventDefault: () => void }) => {
>>>>>>> 23de6f93b5b3b784f78e6e98fbf092e80531bbc2:components/integrations/installed_command.jsx
        e.preventDefault();

        this.props.onRegenToken(this.props.command);
    }

    handleDelete = () => {
        this.props.onDelete(this.props.command);
    }

    render() {
        const command = this.props.command;
        const filter = this.props.filter ? this.props.filter.toLowerCase() : '';

        if (!matchesFilter(command, filter)) {
            return null;
        }

        let name;

        if (command.display_name) {
            name = command.display_name;
        } else {
            name = (
                <FormattedMessage
                    id='installed_commands.unnamed_command'
                    defaultMessage='Unnamed Slash Command'
                />
            );
        }

        let description = null;
        if (command.description) {
            description = (
                <div className='item-details__row'>
                    <span className='item-details__description'>
                        {command.description}
                    </span>
                </div>
            );
        }

        let trigger = '- /' + command.trigger;
        if (command.auto_complete && command.auto_complete_hint) {
            trigger += ' ' + command.auto_complete_hint;
        }

        let actions = null;
        if (this.props.canChange) {
            actions = (
                <div className='item-actions'>
                    <button
                        className='style--none color--link'
                        onClick={this.handleRegenToken}
                    >
                        <FormattedMessage
                            id='installed_integrations.regenToken'
                            defaultMessage='Regenerate Token'
                        />
                    </button>
                    {' - '}
                    <Link to={`/${this.props.team.name}/integrations/commands/edit?id=${command.id}`}>
                        <FormattedMessage
                            id='installed_integrations.edit'
                            defaultMessage='Edit'
                        />
                    </Link>
                    {' - '}
<<<<<<< HEAD:components/integrations/installed_command.tsx
                    <DeleteIntegrationLink
                        modalMessage={
                            <FormattedMessage
                                id='installed_commands.delete.confirm'
                                defaultMessage='This action permanently deletes the slash command and breaks any integrations using it. Are you sure you want to delete it?'
                            />
                        }
=======
                    <DeleteIntegration
>>>>>>> 23de6f93b5b3b784f78e6e98fbf092e80531bbc2:components/integrations/installed_command.jsx
                        onDelete={this.handleDelete}
                    />
                </div>
            );
        }

        const commandToken = command.token;

        return (
            <div className='backstage-list__item'>
                <div className='item-details'>
                    <div className='item-details__row d-flex flex-column flex-md-row justify-content-between'>
                        <div>
                            <strong className='item-details__name'>
                                {name}
                            </strong>
                            <span className='item-details__trigger'>
                                {trigger}
                            </span>
                        </div>
                        {actions}
                    </div>
                    {description}
                    <div className='item-details__row'>
                        <span className='item-details__token'>
                            <FormattedMessage
                                id='installed_integrations.token'
                                defaultMessage='Token: {token}'
                                values={{
                                    token: commandToken,
                                }}
                            />
                            <CopyText
                                value={commandToken}
                            />
                        </span>
                    </div>
                    <div className='item-details__row'>
                        <span className='item-details__creation'>
                            <FormattedMessage
                                id='installed_integrations.creation'
                                defaultMessage='Created by {creator} on {createAt, date, full}'
                                values={{
                                    creator: this.props.creator.username,
                                    createAt: command.create_at,
                                }}
                            />
                        </span>
                    </div>
                </div>
            </div>
        );
    }
}
