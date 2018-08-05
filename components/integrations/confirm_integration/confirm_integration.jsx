// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedHTMLMessage, FormattedMessage} from 'react-intl';
import {Link} from 'react-router-dom';

import {browserHistory} from 'utils/browser_history';
import {Constants, ErrorPageTypes} from 'utils/constants.jsx';
import BackstageHeader from 'components/backstage/components/backstage_header.jsx';
import {getSiteURL} from 'utils/url.jsx';
import FormattedMarkdownMessage from 'components/formatted_markdown_message';
import ErrorMessage from 'components/error_page/error_message.jsx';

export default class ConfirmIntegration extends React.Component {
    static get propTypes() {
        return {
            team: PropTypes.object,
            location: PropTypes.object,
            commands: PropTypes.object,
            oauthApps: PropTypes.object,
            incomingHooks: PropTypes.object,
            outgoingHooks: PropTypes.object,
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

        if (this.state.type === Constants.Integrations.COMMAND && command) {
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
                        defaultMessage='Your slash command has been set up. The following token will be sent in the outgoing payload. Please use it to verify the request came from your Mattermost team (see [documentation](!https://docs.mattermost.com/developer/slash-commands.html) for further details).'
                    />
                </p>
            );
            tokenText = (
                <p className='word-break--all'>
                    <FormattedHTMLMessage
                        id='add_command.token'
                        defaultMessage='<b>Token</b>: {token}'
                        values={{
                            token: command.token,
                        }}
                    />
                </p>
            );
        } else if (this.state.type === Constants.Integrations.INCOMING_WEBHOOK && incomingHook) {
            headerText = (
                <FormattedMessage
                    id={'installed_incoming_webhooks.header'}
                    defaultMessage='Incoming Webhooks'
                />
            );
            helpText = (
                <p>
                    <FormattedHTMLMessage
                        id='add_incoming_webhook.doneHelp'
                        defaultMessage='Your incoming webhook has been set up. Please send data to the following URL (see <a href=\"https://docs.mattermost.com/developer/webhooks-incoming.html\">documentation</a> for further details).'
                    />
                </p>
            );
            tokenText = (
                <p className='word-break--all'>
                    <FormattedHTMLMessage
                        id='add_incoming_webhook.url'
                        defaultMessage='<b>URL</b>: {url}'
                        values={{
                            url: getSiteURL() + '/hooks/' + incomingHook.id,
                        }}
                    />
                </p>
            );
        } else if (this.state.type === Constants.Integrations.OUTGOING_WEBHOOK && outgoingHook) {
            headerText = (
                <FormattedMessage
                    id={'installed_outgoing_webhooks.header'}
                    defaultMessage='Outgoing Webhooks'
                />
            );
            helpText = (
                <p>
                    <FormattedHTMLMessage
                        id='add_outgoing_webhook.doneHelp'
                        defaultMessage='Your outgoing webhook has been set up. The following token will be sent in the outgoing payload. Please use it to verify the request came from your Mattermost team (see <a href=\"https://docs.mattermost.com/developer/webhooks-outgoing.html\">documentation</a> for further details).'
                    />
                </p>
            );
            tokenText = (
                <p className='word-break--all'>
                    <FormattedHTMLMessage
                        id='add_outgoing_webhook.token'
                        defaultMessage='<b>Token</b>: {token}'
                        values={{
                            token: outgoingHook.token,
                        }}
                    />
                </p>
            );
        } else if (this.state.type === Constants.Integrations.OAUTH_APP && oauthApp) {
            headerText = (
                <FormattedMessage
                    id={'installed_oauth_apps.header'}
                    defaultMessage='OAuth 2.0 Applications'
                />
            );

            helpText = [];
            helpText.push(
                <p key='add_oauth_app.doneHelp'>
                    <FormattedHTMLMessage
                        id='add_oauth_app.doneHelp'
                        defaultMessage='Your OAuth 2.0 application has been set up. Please use the following Client ID and Client Secret when requesting authorization for your application (see <a href="https://docs.mattermost.com/developer/oauth-2-0-applications.html">documentation</a> for further details).'
                    />
                </p>
            );
            helpText.push(
                <p key='add_oauth_app.clientId'>
                    <FormattedHTMLMessage
                        id='add_oauth_app.clientId'
                        defaultMessage='<b>Client ID:</b> {id}'
                        values={{
                            id: oauthApp.id,
                        }}
                    /> <br/>
                    <FormattedHTMLMessage
                        id='add_oauth_app.clientSecret'
                        defaultMessage='<b>Client Secret:</b> {secret}'
                        values={{
                            secret: oauthApp.client_secret,
                        }}
                    />
                </p>
            );

            helpText.push(
                <p key='add_oauth_app.doneUrlHelp'>
                    <FormattedHTMLMessage
                        id='add_oauth_app.doneUrlHelp'
                        defaultMessage='The following are your authorized redirect URL(s).'
                    />
                </p>
            );

            tokenText = (
                <p className='word-break--all'>
                    <FormattedHTMLMessage
                        id='add_oauth_app.url'
                        defaultMessage='<b>URL(s)</b>: {url}'
                        values={{
                            url: oauthApp.callback_urls,
                        }}
                    />
                </p>
            );
        } else {
            return (
                <div className='backstage-content row'>
                    <div className='backstage-form backstage-form__confirmation'>
                        <h4><ErrorMessage type={ErrorPageTypes.PAGE_NOT_FOUND}/></h4>
                    </div>
                </div>
            );
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
                    <h4 className='backstage-form__title'>
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
