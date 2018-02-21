// Copyright (c) 2016-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';
import {Link} from 'react-router-dom';

import DeleteIntegration from './delete_integration.jsx';

export default class InstalledOutgoingWebhook extends React.PureComponent {
    static propTypes = {

        /**
        * Data used for showing webhook details
        */
        outgoingWebhook: PropTypes.object.isRequired,

        /**
        * Function used for webhook token regeneration
        */
        onRegenToken: PropTypes.func.isRequired,

        /**
        * Function to call when webhook delete button is pressed
        */
        onDelete: PropTypes.func.isRequired,

        /**
        * String used for filtering webhook item
        */
        filter: PropTypes.string,

        /**
        * Data used for showing created by details
        */
        creator: PropTypes.object.isRequired,

        /**
        *  Set to show available actions on webhook
        */
        canChange: PropTypes.bool.isRequired,

        /**
        *  Data used in routing of webhook for modifications
        */
        team: PropTypes.object.isRequired,

        /**
        *  Data used for filtering of webhooks based in filter prop
        */
        channel: PropTypes.object,
    }

    constructor(props) {
        super(props);

        this.handleRegenToken = this.handleRegenToken.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
    }

    handleRegenToken(e) {
        e.preventDefault();

        this.props.onRegenToken(this.props.outgoingWebhook);
    }

    handleDelete() {
        this.props.onDelete(this.props.outgoingWebhook);
    }

    makeDisplayName(outgoingWebhook, channel) {
        if (outgoingWebhook.display_name) {
            return outgoingWebhook.display_name;
        } else if (channel) {
            return channel.display_name;
        }
        return (
            <FormattedMessage
                id='installed_outgoing_webhooks.unknown_channel'
                defaultMessage='A Private Webhook'
            />
        );
    }

    matchesFilter(outgoingWebhook, channel, filter) {
        if (!filter) {
            return true;
        }

        const {
            display_name: displayName,
            description,
            trigger_words: triggerWords,
        } = outgoingWebhook;

        if (
            (displayName && displayName.toLowerCase().indexOf(filter) !== -1) ||
            (description && description.toLowerCase().indexOf(filter) !== -1)
        ) {
            return true;
        }

        if (triggerWords) {
            for (const triggerWord of triggerWords) {
                if (triggerWord.toLowerCase().indexOf(filter) !== -1) {
                    return true;
                }
            }
        }

        if (channel && channel.name) {
            if (channel.name.toLowerCase().indexOf(filter) !== -1) {
                return true;
            }
        }

        return false;
    }

    render() {
        const outgoingWebhook = this.props.outgoingWebhook;
        const channel = this.props.channel;
        const filter = this.props.filter ? this.props.filter.toLowerCase() : '';
        const triggerWordsFull = 0;
        const triggerWordsStartsWith = 1;

        if (outgoingWebhook && !this.matchesFilter(outgoingWebhook, channel, filter)) {
            return null;
        }

        const displayName = this.makeDisplayName(outgoingWebhook, channel);

        let description = null;
        if (outgoingWebhook.description) {
            description = (
                <div className='item-details__row'>
                    <span className='item-details__description'>
                        {outgoingWebhook.description}
                    </span>
                </div>
            );
        }

        let triggerWords = null;
        if (outgoingWebhook.trigger_words && outgoingWebhook.trigger_words.length > 0) {
            triggerWords = (
                <div className='item-details__row'>
                    <span className='item-details__trigger-words'>
                        <FormattedMessage
                            id='installed_integrations.triggerWords'
                            defaultMessage='Trigger Words: {triggerWords}'
                            values={{
                                triggerWords: outgoingWebhook.trigger_words.join(', '),
                            }}
                        />
                    </span>
                </div>
            );
        }

        const urls = (
            <div className='item-details__row'>
                <span className='item-details__url'>
                    <FormattedMessage
                        id='installed_integrations.callback_urls'
                        defaultMessage='Callback URLs: {urls}'
                        values={{
                            urls: outgoingWebhook.callback_urls.join(', '),
                        }}
                    />
                </span>
            </div>
        );

        let triggerWhen;
        if (outgoingWebhook.trigger_when === triggerWordsFull) {
            triggerWhen = (
                <FormattedMessage
                    id='add_outgoing_webhook.triggerWordsTriggerWhenFullWord'
                    defaultMessage='First word matches a trigger word exactly'
                />
            );
        } else if (outgoingWebhook.trigger_when === triggerWordsStartsWith) {
            triggerWhen = (
                <FormattedMessage
                    id='add_outgoing_webhook.triggerWordsTriggerWhenStartsWith'
                    defaultMessage='First word starts with a trigger word'
                />
            );
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
                            defaultMessage='Regen Token'
                        />
                    </button>
                    {' - '}
                    <Link to={`/${this.props.team.name}/integrations/outgoing_webhooks/edit?id=${outgoingWebhook.id}`}>
                        <FormattedMessage
                            id='installed_integrations.edit'
                            defaultMessage='Edit'
                        />
                    </Link>
                    {' - '}
                    <DeleteIntegration
                        messageId='installed_outgoing_webhooks.delete.confirm'
                        onDelete={this.handleDelete}
                    />
                </div>
            );
        }

        return (
            <div className='backstage-list__item'>
                <div className='item-details'>
                    <div className='item-details__row'>
                        <span className='item-details__name'>
                            {displayName}
                        </span>
                    </div>
                    {description}
                    <div className='item-details__row'>
                        <span className='item-details__content_type'>
                            <FormattedMessage
                                id='installed_integrations.content_type'
                                defaultMessage='Content-Type: {contentType}'
                                values={{
                                    contentType: outgoingWebhook.content_type || 'application/x-www-form-urlencoded',
                                }}
                            />
                        </span>
                    </div>
                    {triggerWords}
                    <div className='item-details__row'>
                        <span className='item-details__trigger-when'>
                            <FormattedMessage
                                id='installed_integrations.triggerWhen'
                                defaultMessage='Trigger When: {triggerWhen}'
                                values={{
                                    triggerWhen,
                                }}
                            />
                        </span>
                    </div>
                    <div className='item-details__row'>
                        <span className='item-details__token'>
                            <FormattedMessage
                                id='installed_integrations.token'
                                defaultMessage='Token: {token}'
                                values={{
                                    token: outgoingWebhook.token,
                                }}
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
                                    createAt: outgoingWebhook.create_at,
                                }}
                            />
                        </span>
                    </div>
                    {urls}
                </div>
                {actions}
            </div>
        );
    }
}
