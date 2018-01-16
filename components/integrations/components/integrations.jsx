// Copyright (c) 2016-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';

import {Permissions} from 'mattermost-redux/constants';

import * as Utils from 'utils/utils.jsx';
import IncomingWebhookIcon from 'images/incoming_webhook.jpg';
import OAuthIcon from 'images/oauth_icon.png';
import OutgoingWebhookIcon from 'images/outgoing_webhook.jpg';
import SlashCommandIcon from 'images/slash_command_icon.jpg';

import SystemPermissionGate from 'components/permissions_gates/system_permission_gate';
import TeamPermissionGate from 'components/permissions_gates/team_permission_gate';

import IntegrationOption from './integration_option.jsx';

export default class Integrations extends React.Component {
    static get propTypes() {
        return {
            team: PropTypes.object,
            user: PropTypes.object
        };
    }

    constructor(props) {
        super(props);

        this.updateTitle = this.updateTitle.bind(this);
    }

    componentDidMount() {
        this.updateTitle();
    }

    updateTitle() {
        let currentSiteName = '';
        if (global.window.mm_config.SiteName != null) {
            currentSiteName = global.window.mm_config.SiteName;
        }

        document.title = Utils.localizeMessage('admin.sidebar.integrations', 'Integrations') + ' - ' + this.props.team.display_name + ' ' + currentSiteName;
    }

    render() {
        const options = [];
        const config = window.mm_config;

        if (config.EnableIncomingWebhooks === 'true') {
            options.push(
                <TeamPermissionGate
                    teamId={this.props.team.id}
                    perms={Permissions.MANAGE_WEBHOOKS}
                    key='incomingWebhookPerm'
                >
                    <IntegrationOption
                        key='incomingWebhook'
                        image={IncomingWebhookIcon}
                        title={
                            <FormattedMessage
                                id='integrations.incomingWebhook.title'
                                defaultMessage='Incoming Webhook'
                            />
                        }
                        description={
                            <FormattedMessage
                                id='integrations.incomingWebhook.description'
                                defaultMessage='Incoming webhooks allow external integrations to send messages'
                            />
                        }
                        link={'/' + this.props.team.name + '/integrations/incoming_webhooks'}
                    />
                </TeamPermissionGate>
            );
        }

        if (config.EnableOutgoingWebhooks === 'true') {
            options.push(
                <TeamPermissionGate
                    teamId={this.props.team.id}
                    perms={Permissions.MANAGE_WEBHOOKS}
                    key='outgoingWebhookPerm'
                >
                    <IntegrationOption
                        key='outgoingWebhook'
                        image={OutgoingWebhookIcon}
                        title={
                            <FormattedMessage
                                id='integrations.outgoingWebhook.title'
                                defaultMessage='Outgoing Webhook'
                            />
                        }
                        description={
                            <FormattedMessage
                                id='integrations.outgoingWebhook.description'
                                defaultMessage='Outgoing webhooks allow external integrations to receive and respond to messages'
                            />
                        }
                        link={'/' + this.props.team.name + '/integrations/outgoing_webhooks'}
                    />
                </TeamPermissionGate>
            );
        }

        if (config.EnableCommands === 'true') {
            options.push(
                <TeamPermissionGate
                    teamId={this.props.team.id}
                    perms={Permissions.MANAGE_SLASH_COMMANDS}
                    key='commandPerm'
                >
                    <IntegrationOption
                        key='command'
                        image={SlashCommandIcon}
                        title={
                            <FormattedMessage
                                id='integrations.command.title'
                                defaultMessage='Slash Command'
                            />
                        }
                        description={
                            <FormattedMessage
                                id='integrations.command.description'
                                defaultMessage='Slash commands send events to an external integration'
                            />
                        }
                        link={'/' + this.props.team.name + '/integrations/commands'}
                    />
                </TeamPermissionGate>
            );
        }

        if (config.EnableOAuthServiceProvider === 'true') {
            options.push(
                <SystemPermissionGate
                    perms={Permissions.MANAGE_OAUTH}
                    key='oauth2AppsPerm'
                >
                    <IntegrationOption
                        key='oauth2Apps'
                        image={OAuthIcon}
                        title={
                            <FormattedMessage
                                id='integrations.oauthApps.title'
                                defaultMessage='OAuth 2.0 Applications'
                            />
                        }
                        description={
                            <FormattedMessage
                                id='integrations.oauthApps.description'
                                defaultMessage='Auth 2.0 allows external applications to make authorized requests to the Mattermost API.'
                            />
                        }
                        link={'/' + this.props.team.name + '/integrations/oauth2-apps'}
                    />
                </SystemPermissionGate>
            );
        }

        return (
            <div className='backstage-content row'>
                <div className='backstage-header'>
                    <h1>
                        <FormattedMessage
                            id='integrations.header'
                            defaultMessage='Integrations'
                        />
                    </h1>
                </div>
                <div className='backstage-list__help'>
                    <FormattedMessage
                        id='integrations.help'
                        defaultMessage='Visit the {appDirectory} to find self-hosted, third-party apps and integrations for Mattermost.'
                        values={{
                            appDirectory: (
                                <a
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    href='https://about.mattermost.com/default-app-directory/'
                                >
                                    <FormattedMessage
                                        id='integrations.help.appDirectory'
                                        defaultMessage='App Directory'
                                    />
                                </a>
                            )
                        }}
                    />
                </div>
                <div>
                    {options}
                </div>
            </div>
        );
    }
}
