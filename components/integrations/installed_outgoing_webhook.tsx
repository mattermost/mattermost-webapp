// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';
import {Link} from 'react-router-dom';

import CopyText from 'components/copy_text';
import Toggle from 'components/toggle';

import {PencilOutlineIcon, RefreshIcon} from '@mattermost/compass-icons/components';
import {OutgoingWebhook} from '@mattermost/types/integrations';
import {Team} from '@mattermost/types/teams';
import {UserProfile} from '@mattermost/types/users';
import {Channel} from '@mattermost/types/channels';

import DeleteIntegrationLink from './delete_integration_link';

export function matchesFilter(outgoingWebhook: OutgoingWebhook, channel: Channel, filter: string) {
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

type Props = {
    outgoingWebhook: OutgoingWebhook;
    onRegenToken: (outgoingWebhook: OutgoingWebhook) => void;
    onDelete: (outgoingWebhook: OutgoingWebhook) => void;
    onToggle: (outgoingWebhook: OutgoingWebhook) => void;
    team: Team;
    creator: UserProfile;
    channel: Channel;
    canChange: boolean;
    filter?: string;
}

export default class InstalledOutgoingWebhook extends React.PureComponent<Props> {
    handleRegenToken = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();

        this.props.onRegenToken(this.props.outgoingWebhook);
    }

    handleDelete = () => {
        this.props.onDelete(this.props.outgoingWebhook);
    }

    handleToggle = () => {
        const outgoingWebhook = this.props.outgoingWebhook;
        const toggledWebhook = {
            ...outgoingWebhook,
            enabled: !outgoingWebhook.enabled,
        };
        this.props.onToggle(toggledWebhook);
    }

    makeDisplayName(outgoingWebhook: OutgoingWebhook, channel: Channel) {
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

    render() {
        const outgoingWebhook = this.props.outgoingWebhook;
        const channel = this.props.channel;
        const filter = this.props.filter ? this.props.filter.toLowerCase() : '';
        const triggerWordsFull = 0;
        const triggerWordsStartsWith = 1;

        if (outgoingWebhook && !matchesFilter(outgoingWebhook, channel, filter)) {
            return null;
        }

        const displayName = this.makeDisplayName(outgoingWebhook, channel);

        const displayEnabled = outgoingWebhook.enabled ? null : (
            <FormattedMessage
                id='installed_outgoing_webhooks.disabled_webhook'
                defaultMessage=' (Disabled)'
            />
        );

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
                <span className='item-details__url word-break--all'>
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
                        <RefreshIcon>
                            size={12}
                        </RefreshIcon>
                    </button>
                    <Link
                        className='item-actions-edit'
                        to={`/${this.props.team.name}/integrations/outgoing_webhooks/edit?id=${outgoingWebhook.id}`}
                    >
                        <PencilOutlineIcon>
                            size={12}
                        </PencilOutlineIcon>
                    </Link>
                    <DeleteIntegrationLink
                        modalMessage={
                            <FormattedMessage
                                id='installed_outgoing_webhooks.delete.confirm'
                                defaultMessage='This action permanently deletes the outgoing webhook and breaks any integrations using it. Are you sure you want to delete it?'
                            />
                        }
                        onDelete={this.handleDelete}
                    />
                    <Toggle
                        disabled={false}
                        onToggle={this.handleToggle}
                        toggled={this.props.outgoingWebhook.enabled}
                        size={'btn-sm'}
                    />
                </div>
            );
        }

        return (
            <div className='backstage-list__item'>
                <div className='item-details'>
                    <div className='item-details__row d-flex flex-column flex-md-row justify-content-between'>
                        <strong className='item-details__name'>
                            {displayName}
                            {displayEnabled}
                        </strong>
                        {actions}
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
                            <CopyText
                                value={outgoingWebhook.token}
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
            </div>
        );
    }
}
