// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';
import {Link} from 'react-router-dom';

import * as Utils from 'utils/utils.jsx';
import {t} from 'utils/i18n';
import FormError from 'components/form_error';
import FormattedMarkdownMessage from 'components/formatted_markdown_message.jsx';
import CopyText from 'components/copy_text';

import DeleteIntegration from '../delete_integration.jsx';

const FAKE_SECRET = '***************';

export function matchesFilter(oauthApp, filter) {
    if (!filter) {
        return true;
    }

    return oauthApp.name.toLowerCase().indexOf(filter) !== -1;
}

export default class InstalledOAuthApp extends React.PureComponent {
    static propTypes = {

        /**
        * The team data
        */
        team: PropTypes.object,

        /**
        * The oauthApp data
        */
        oauthApp: PropTypes.object.isRequired,

        creatorName: PropTypes.string.isRequired,

        /**
        * The function to call when Regenerate Secret link is clicked
        */
        onRegenerateSecret: PropTypes.func.isRequired,

        /**
        * The function to call when Delete link is clicked
        */
        onDelete: PropTypes.func.isRequired,

        /**
        * Set to filter OAuthApp
        */
        filter: PropTypes.string,
    }

    constructor(props) {
        super(props);

        this.state = {
            clientSecret: FAKE_SECRET,
        };
    }

    handleShowClientSecret = (e) => {
        if (e && e.preventDefault) {
            e.preventDefault();
        }
        this.setState({clientSecret: this.props.oauthApp.client_secret});
    }

    handleHideClientSecret = (e) => {
        e.preventDefault();
        this.setState({clientSecret: FAKE_SECRET});
    }

    handleRegenerate = (e) => {
        e.preventDefault();
        this.props.onRegenerateSecret(this.props.oauthApp.id).then(
            ({error}) => {
                if (error) {
                    this.setState({error: error.message});
                } else {
                    this.setState({error: null});
                    this.handleShowClientSecret();
                }
            },
        );
    }

    handleDelete = () => {
        this.props.onDelete(this.props.oauthApp);
    }

    render() {
        const {oauthApp, creatorName} = this.props;
        let error;

        if (this.state.error) {
            error = (
                <FormError
                    error={this.state.error}
                />
            );
        }

        if (!matchesFilter(oauthApp, this.props.filter)) {
            return null;
        }

        let name;
        if (oauthApp.name) {
            name = oauthApp.name;
        } else {
            name = (
                <FormattedMessage
                    id='installed_integrations.unnamed_oauth_app'
                    defaultMessage='Unnamed OAuth 2.0 Application'
                />
            );
        }

        let description;
        if (oauthApp.description) {
            description = (
                <div className='item-details__row'>
                    <span className='item-details__description'>
                        {oauthApp.description}
                    </span>
                </div>
            );
        }

        const urls = (
            <div className='item-details__row'>
                <span className='item-details__url word-break--all'>
                    <FormattedMessage
                        id='installed_integrations.callback_urls'
                        defaultMessage='Callback URLs: {urls}'
                        values={{
                            urls: oauthApp.callback_urls.join(', '),
                        }}
                    />
                </span>
            </div>
        );

        let isTrusted;
        if (oauthApp.is_trusted) {
            isTrusted = Utils.localizeMessage('installed_oauth_apps.trusted.yes', 'Yes');
        } else {
            isTrusted = Utils.localizeMessage('installed_oauth_apps.trusted.no', 'No');
        }

        let showHide;
        let clientSecret;
        if (this.state.clientSecret === FAKE_SECRET) {
            showHide = (
                <button
                    id='showSecretButton'
                    className='style--none color--link'
                    onClick={this.handleShowClientSecret}
                >
                    <FormattedMessage
                        id='installed_integrations.showSecret'
                        defaultMessage='Show Secret'
                    />
                </button>
            );
            clientSecret = (
                <span className='item-details__token'>
                    <FormattedMessage
                        id='installed_integrations.client_secret'
                        defaultMessage='Client Secret: **{clientSecret}**'
                        values={{
                            clientSecret: this.state.clientSecret,
                        }}
                    />
                </span>
            );
        } else {
            showHide = (
                <button
                    id='hideSecretButton'
                    className='style--none color--link'
                    onClick={this.handleHideClientSecret}
                >
                    <FormattedMessage
                        id='installed_integrations.hideSecret'
                        defaultMessage='Hide Secret'
                    />
                </button>
            );
            clientSecret = (
                <span className='item-details__token'>
                    <FormattedMarkdownMessage
                        id='installed_integrations.client_secret'
                        defaultMessage='Client Secret: **{clientSecret}**'
                        values={{
                            clientSecret: this.state.clientSecret,
                        }}
                    />
                    <CopyText
                        idMessage='integrations.copy_client_secret'
                        defaultMessage='Copy Client Secret'
                        value={this.state.clientSecret}
                    />
                </span>
            );
        }

        const regen = (
            <button
                id='regenerateSecretButton'
                className='style--none color--link'
                onClick={this.handleRegenerate}
            >
                <FormattedMessage
                    id='installed_integrations.regenSecret'
                    defaultMessage='Regenerate Secret'
                />
            </button>
        );

        let icon;
        if (oauthApp.icon_url) {
            icon = (
                <div className='integration__icon integration-list__icon'>
                    <img
                        alt={'get app screenshot'}
                        src={oauthApp.icon_url}
                    />
                </div>
            );
        }

        return (
            <div className='backstage-list__item'>
                {icon}
                <div className='item-details'>
                    <div className='item-details__row d-flex flex-column flex-md-row justify-content-between'>
                        <strong className='item-details__name'>
                            {name}
                        </strong>
                        <div className='item-actions'>
                            {showHide}
                            {' - '}
                            {regen}
                            {' - '}
                            <Link to={`/${this.props.team.name}/integrations/oauth2-apps/edit?id=${oauthApp.id}`}>
                                <FormattedMessage
                                    id='installed_integrations.edit'
                                    defaultMessage='Edit'
                                />
                            </Link>
                            {' - '}
                            <DeleteIntegration
                                messageId={t('installed_oauth_apps.delete.confirm')}
                                onDelete={this.handleDelete}
                            />
                        </div>
                    </div>
                    {error}
                    {description}
                    <div className='item-details__row'>
                        <span className='item-details__url word-break--all'>
                            <FormattedMarkdownMessage
                                id='installed_oauth_apps.is_trusted'
                                defaultMessage='Is Trusted: **{isTrusted}**'
                                values={{
                                    isTrusted,
                                }}
                            />
                        </span>
                    </div>
                    <div className='item-details__row'>
                        <span className='item-details__token'>
                            <FormattedMarkdownMessage
                                id='installed_integrations.client_id'
                                defaultMessage='Client ID: **{clientId}**'
                                values={{
                                    clientId: oauthApp.id,
                                }}
                            />
                            <CopyText
                                idMessage='integrations.copy_client_id'
                                defaultMessage='Copy Client Id'
                                value={oauthApp.id}
                            />
                        </span>
                    </div>
                    <div className='item-details__row'>
                        {clientSecret}
                    </div>
                    {urls}
                    <div className='item-details__row'>
                        <span className='item-details__creation'>
                            <FormattedMessage
                                id='installed_integrations.creation'
                                defaultMessage='Created by {creator} on {createAt, date, full}'
                                values={{
                                    creator: creatorName,
                                    createAt: oauthApp.create_at,
                                }}
                            />
                        </span>
                    </div>
                </div>
            </div>
        );
    }
}
