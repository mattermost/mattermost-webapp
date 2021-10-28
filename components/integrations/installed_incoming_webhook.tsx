// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';
import {Link} from 'react-router-dom';
import {IncomingWebhook} from 'mattermost-redux/types/integrations';

import {IncomingWebhook} from 'mattermost-redux/types/integrations';

import {getSiteURL} from 'utils/url';

import CopyText from 'components/copy_text';

<<<<<<< HEAD:components/integrations/installed_incoming_webhook.tsx
import DeleteIntegrationLink from './delete_integration_link';
import { Team } from 'mattermost-redux/types/teams';
import {Channel} from 'mattermost-redux/types/channels';
import {UserProfile} from 'mattermost-redux/types/users';


export function matchesFilter(incomingWebhook : IncomingWebhook, filter : string, channel? : Channel) {
=======
import {Team} from 'mattermost-redux/types/teams';
import {Channel} from 'mattermost-redux/types/channels';
import {UserProfile} from 'mattermost-redux/types/users';

import DeleteIntegration from './delete_integration';

export function matchesFilter(incomingWebhook: IncomingWebhook, channel?: Channel, filter?: string) {
>>>>>>> 23de6f93b5b3b784f78e6e98fbf092e80531bbc2:components/integrations/installed_incoming_webhook.jsx
    if (!filter) {
        return true;
    }

    if (incomingWebhook?.display_name?.toLowerCase().indexOf(filter) !== -1 ||
        incomingWebhook.description?.toLowerCase().indexOf(filter) !== -1) {
        return true;
    }

    if (incomingWebhook.channel_id) {
        if (channel && channel.name.toLowerCase().indexOf(filter) !== -1) {
            return true;
        }
    }

    return false;
}

type Props = {

    /**
    * Data used for showing webhook details
    */
<<<<<<< HEAD:components/integrations/installed_incoming_webhook.tsx
    incomingWebhook: IncomingWebhook,
=======
    incomingWebhook: IncomingWebhook;
>>>>>>> 23de6f93b5b3b784f78e6e98fbf092e80531bbc2:components/integrations/installed_incoming_webhook.jsx

    /**
    * Function to call when webhook delete button is pressed
    */
<<<<<<< HEAD:components/integrations/installed_incoming_webhook.tsx
    onDelete: (hook : IncomingWebhook) => void,
=======
    onDelete: (hook: IncomingWebhook) => void;
>>>>>>> 23de6f93b5b3b784f78e6e98fbf092e80531bbc2:components/integrations/installed_incoming_webhook.jsx

    /**
    * String used for filtering webhook item
    */
<<<<<<< HEAD:components/integrations/installed_incoming_webhook.tsx
    filter?: string,
=======
    filter?: string;
>>>>>>> 23de6f93b5b3b784f78e6e98fbf092e80531bbc2:components/integrations/installed_incoming_webhook.jsx

    /**
    * Data used for showing created by details
    */
<<<<<<< HEAD:components/integrations/installed_incoming_webhook.tsx
    creator: UserProfile,
=======
    creator: UserProfile;
>>>>>>> 23de6f93b5b3b784f78e6e98fbf092e80531bbc2:components/integrations/installed_incoming_webhook.jsx

    /**
    *  Set to show available actions on webhook
    */
<<<<<<< HEAD:components/integrations/installed_incoming_webhook.tsx
    canChange: boolean,
=======
    canChange: boolean;
>>>>>>> 23de6f93b5b3b784f78e6e98fbf092e80531bbc2:components/integrations/installed_incoming_webhook.jsx

    /**
    *  Data used in routing of webhook for modifications
    */
<<<<<<< HEAD:components/integrations/installed_incoming_webhook.tsx
    team: Team,
=======
    team: Team;
>>>>>>> 23de6f93b5b3b784f78e6e98fbf092e80531bbc2:components/integrations/installed_incoming_webhook.jsx

    /**
    *  Data used for filtering of webhook based on filter prop
    */
<<<<<<< HEAD:components/integrations/installed_incoming_webhook.tsx
    channel?: Channel,
}

export default class InstalledIncomingWebhook extends React.PureComponent<Props> {

=======
    channel?: Channel;
}
>>>>>>> 23de6f93b5b3b784f78e6e98fbf092e80531bbc2:components/integrations/installed_incoming_webhook.jsx

export default class InstalledIncomingWebhook extends React.PureComponent<Props> {
    handleDelete = () => {
        this.props.onDelete(this.props.incomingWebhook);
    }

    render() {
        const incomingWebhook = this.props.incomingWebhook;
        const channel = this.props.channel;
        const filter = this.props.filter ? this.props.filter.toLowerCase() : '';

        if (!matchesFilter(incomingWebhook, filter, channel)) {
            return null;
        }

        let displayName;
        if (incomingWebhook.display_name) {
            displayName = incomingWebhook.display_name;
        } else if (channel) {
            displayName = channel.display_name;
        } else {
            displayName = (
                <FormattedMessage
                    id='installed_incoming_webhooks.unknown_channel'
                    defaultMessage='A Private Webhook'
                />
            );
        }

        let description = null;
        if (incomingWebhook.description) {
            description = (
                <div className='item-details__row'>
                    <span className='item-details__description'>
                        {incomingWebhook.description}
                    </span>
                </div>
            );
        }

        let actions = null;
        if (this.props.canChange) {
            actions = (
                <div className='item-actions'>
                    <Link to={`/${this.props.team.name}/integrations/incoming_webhooks/edit?id=${incomingWebhook.id}`}>
                        <FormattedMessage
                            id='installed_integrations.edit'
                            defaultMessage='Edit'
                        />
                    </Link>
                    {' - '}
<<<<<<< HEAD:components/integrations/installed_incoming_webhook.tsx
                    <DeleteIntegrationLink
                        modalMessage={
                            <FormattedMessage
                                id='installed_incoming_webhooks.delete.confirm'
                                defaultMessage='This action permanently deletes the incoming webhook and breaks any integrations using it. Are you sure you want to delete it?'
                            />
                        }
=======
                    <DeleteIntegration
>>>>>>> 23de6f93b5b3b784f78e6e98fbf092e80531bbc2:components/integrations/installed_incoming_webhook.jsx
                        onDelete={this.handleDelete}
                    />
                </div>
            );
        }

        const incomingWebhookId = getSiteURL() + '/hooks/' + incomingWebhook.id;

        return (
            <div className='backstage-list__item'>
                <div className='item-details'>
                    <div className='item-details__row d-flex flex-column flex-md-row justify-content-between'>
                        <strong className='item-details__name'>
                            {displayName}
                        </strong>
                        {actions}
                    </div>
                    {description}
                    <div className='item-details__row'>
                        <span className='item-details__url word-break--all'>
                            <FormattedMessage
                                id='installed_integrations.url'
                                defaultMessage='URL: {url}'
                                values={{
                                    url: incomingWebhookId,
                                }}
                            />
                            <span>
                                <CopyText
                                    value={incomingWebhookId}
                                />
                            </span>
                        </span>
                    </div>
                    <div className='item-details__row'>
                        <span className='item-details__creation'>
                            <FormattedMessage
                                id='installed_integrations.creation'
                                defaultMessage='Created by {creator} on {createAt, date, full}'
                                values={{
                                    creator: this.props.creator.username,
                                    createAt: incomingWebhook.create_at,
                                }}
                            />
                        </span>
                    </div>
                </div>
            </div>
        );
    }
}
