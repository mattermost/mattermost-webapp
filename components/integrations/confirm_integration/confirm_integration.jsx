// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';
import {Link} from 'react-router-dom';

import {browserHistory} from 'utils/browser_history';
import {Constants, ErrorPageTypes} from 'utils/constants.jsx';
import CopyText from 'components/copy_text';
import BackstageHeader from 'components/backstage/components/backstage_header.jsx';
import {getSiteURL} from 'utils/url';
import FormattedMarkdownMessage from 'components/formatted_markdown_message';

export default class ConfirmIntegration extends React.PureComponent {
    static get propTypes() {
        return {
            team: PropTypes.object,
            location: PropTypes.object,
            commands: PropTypes.object,
            oauthApps: PropTypes.object,
            incomingHooks: PropTypes.object,
            outgoingHooks: PropTypes.object,
            bots: PropTypes.object,
        };
    }

    constructor(props) {
        super(props);
        this.state = {
            type: (new URLSearchParams(this.props.location.search)).get('type'),
            id: (new URLSearchParams(this.props.location.search)).get('id'),
        };
    }

    componentDidMount() {
        window.addEventListener('keypress', this.handleKeyPress);
    }

    componentWillUnmount() {
        window.removeEventListener('keypress', this.handleKeyPress);
    }

    handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            browserHistory.push('/' + this.props.team.name + '/integrations/' + this.state.type);
        }
    }

    render() {
        let headerText = null;
        let helpText = null;
        let tokenText = null;

        const command = this.props.commands[this.state.id];
        const incomingHook = this.props.incomingHooks[this.state.id];
        const outgoingHook = this.props.outgoingHooks[this.state.id];
        const oauthApp = this.props.oauthApps[this.state.id];
        const bot = this.props.bots[this.state.id];

        if (this.state.type === Constants.Integrations.COMMAND && command) {
            const commandToken = command.token;

            headerText = (
                <FormattedMessage
                    id={'installed_commands.header'}
                    defaultMessage='Slash Commands'
                />
            );
            helpText = (
                <p>
                    <FormattedMarkdownMessage
                        id='add_command.doneHelp'
                        defaultMessage='Your slash command is set up. The following token will be sent in the outgoing payload. Please use it to verify the request came from your Mattermost team (details at [Slash Commands](!https://docs.mattermost.com/developer/slash-commands.html)).'
                    />
                </p>
            );
            tokenText = (
                <p className='word-break--all'>
                    <FormattedMarkdownMessage
                        id='add_command.token'
                        defaultMessage='**Token**: {token}'
                        values={{
                            token: commandToken,
                        }}
                    />
                    <CopyText
                        value={commandToken}
                    />
                </p>
            );
        } else if (this.state.type === Constants.Integrations.INCOMING_WEBHOOK && incomingHook) {
            const incomingHookToken = getSiteURL() + '/hooks/' + incomingHook.id;

            headerText = (
                <FormattedMessage
                    id={'installed_incoming_webhooks.header'}
                    defaultMessage='Incoming Webhooks'
                />
            );
            helpText = (
                <p>
                    <FormattedMarkdownMessage
                        id='add_incoming_webhook.doneHelp'
                        defaultMessage='Your incoming webhook is set up. Please send data to the following URL (details at [Incoming Webhooks](!https://docs.mattermost.com/developer/webhooks-incoming.html)).'
                    />
                </p>
            );
            tokenText = (
                <p className='word-break--all'>
                    <FormattedMarkdownMessage
                        id='add_incoming_webhook.url'
                        defaultMessage='**URL**: {url}'
                        values={{
                            url: '`' + incomingHookToken + '`',
                        }}
                    />
                    <CopyText
                        idMessage='integrations.copy_client_secret'
                        defaultMessage='Copy Client Secret'
                        value={incomingHookToken}
                    />
                </p>
            );
        } else if (this.state.type === Constants.Integrations.OUTGOING_WEBHOOK && outgoingHook) {
            const outgoingHookToken = outgoingHook.token;

            headerText = (
                <FormattedMessage
                    id={'installed_outgoing_webhooks.header'}
                    defaultMessage='Outgoing Webhooks'
                />
            );
            helpText = (
                <p>
                    <FormattedMarkdownMessage
                        id='add_outgoing_webhook.doneHelp'
                        defaultMessage='Your outgoing webhook is set up. The following token will be sent in the outgoing payload. Please use it to verify that the request came from your Mattermost team (details at [Outgoing Webhooks](!https://docs.mattermost.com/developer/webhooks-outgoing.html)).'
                    />
                </p>
            );
            tokenText = (
                <p className='word-break--all'>
                    <FormattedMarkdownMessage
                        id='add_outgoing_webhook.token'
                        defaultMessage='**Token**: {token}'
                        values={{
                            token: outgoingHookToken,
                        }}
                    />
                    <CopyText
                        value={outgoingHookToken}
                    />
                </p>
            );
        } else if (this.state.type === Constants.Integrations.OAUTH_APP && oauthApp) {
            const oauthAppToken = oauthApp.id;
            const oauthAppSecret = oauthApp.client_secret;

            headerText = (
                <FormattedMessage
                    id={'installed_oauth_apps.header'}
                    defaultMessage='OAuth 2.0 Applications'
                />
            );

            helpText = [];
            helpText.push(
                <p key='add_oauth_app.doneHelp'>
                    <FormattedMarkdownMessage
                        id='add_oauth_app.doneHelp'
                        defaultMessage='Your OAuth 2.0 application is set up. Please use the following Client ID and Client Secret when requesting authorization for your application (details at [oAuth 2 Applications](!https://docs.mattermost.com/developer/oauth-2-0-applications.html)).'
                    />
                </p>,
            );
            helpText.push(
                <p key='add_oauth_app.clientId'>
                    <FormattedMarkdownMessage
                        id='add_oauth_app.clientId'
                        defaultMessage='**Client ID**: {id}'
                        values={{
                            id: oauthAppToken,
                        }}
                    />
                    <CopyText
                        idMessage='integrations.copy_client_id'
                        defaultMessage='Copy Client Id'
                        value={oauthAppToken}
                    />
                    <br/>
                    <FormattedMarkdownMessage
                        id='add_oauth_app.clientSecret'
                        defaultMessage='**Client Secret**: {secret}'
                        values={{
                            secret: oauthAppSecret,
                        }}
                    />
                    <CopyText
                        idMessage='integrations.copy_client_secret'
                        defaultMessage='Copy Client Secret'
                        value={oauthAppSecret}
                    />
                </p>,
            );

            helpText.push(
                <p key='add_oauth_app.doneUrlHelp'>
                    <FormattedMessage
                        id='add_oauth_app.doneUrlHelp'
                        defaultMessage='Here are your authorized redirect URLs.'
                    />
                </p>,
            );

            tokenText = (
                <p className='word-break--all'>
                    <FormattedMarkdownMessage
                        id='add_oauth_app.url'
                        defaultMessage='**URL(s)**: {url}'
                        values={{
                            url: oauthApp.callback_urls.join(', '),
                        }}
                    />
                </p>
            );
        } else if (this.state.type === Constants.Integrations.BOT && bot) {
            const botToken = (new URLSearchParams(this.props.location.search)).get('token');

            headerText = (
                <FormattedMessage
                    id='bots.manage.header'
                    defaultMessage='Bot Accounts'
                />
            );
            helpText = (
                <p>
                    <FormattedMarkdownMessage
                        id='bots.manage.created.text'
                        defaultMessage='Your bot account **{botname}** has been created successfully. Please use the following access token to connect to the bot (see [documentation](https://mattermost.com/pl/default-bot-accounts) for further details).'
                        values={{
                            botname: bot.display_name || bot.username,
                        }}
                    />
                </p>
            );
            tokenText = (
                <p className='word-break--all'>
                    <FormattedMarkdownMessage
                        id='add_outgoing_webhook.token'
                        defaultMessage='**Token**: {token}'
                        values={{
                            token: botToken,
                        }}
                    />
                    <CopyText
                        value={botToken}
                    />
                    <br/>
                    <br/>
                    <FormattedMarkdownMessage
                        id='add_outgoing_webhook.token.message'
                        defaultMessage='Make sure to add this bot account to teams and channels you want it to interact in. See [documentation](https://mattermost.com/pl/default-bot-accounts) to learn more.'
                    />
                </p>
            );
        } else {
            browserHistory.replace(`/error?type=${ErrorPageTypes.PAGE_NOT_FOUND}`);
            return '';
        }

        return (
            <div className='backstage-content row'>
                <BackstageHeader>
                    <Link to={'/' + this.props.team.name + '/integrations/' + this.state.type}>
                        {headerText}
                    </Link>
                    <FormattedMessage
                        id='integrations.add'
                        defaultMessage='Add'
                    />
                </BackstageHeader>
                <div className='backstage-form backstage-form__confirmation'>
                    <h4
                        className='backstage-form__title'
                        id='formTitle'
                    >
                        <FormattedMessage
                            id='integrations.successful'
                            defaultMessage='Setup Successful'
                        />
                    </h4>
                    {helpText}
                    {tokenText}
                    <div className='backstage-form__footer'>
                        <Link
                            className='btn btn-primary'
                            type='submit'
                            to={'/' + this.props.team.name + '/integrations/' + this.state.type}
                            id='doneButton'
                        >
                            <FormattedMessage
                                id='integrations.done'
                                defaultMessage='Done'
                            />
                        </Link>
                    </div>
                </div>
            </div>
        );
    }
}
