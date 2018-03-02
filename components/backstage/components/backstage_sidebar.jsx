// Copyright (c) 2016-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';

import TeamStore from 'stores/team_store.jsx';
import * as Utils from 'utils/utils.jsx';

import BackstageCategory from './backstage_category.jsx';
import BackstageSection from './backstage_section.jsx';

export default class BackstageSidebar extends React.Component {
    static get propTypes() {
        return {
            team: PropTypes.object.isRequired,
            user: PropTypes.object.isRequired,
            enableCustomEmoji: PropTypes.bool.isRequired,
            enableIncomingWebhooks: PropTypes.bool.isRequired,
            enableOutgoingWebhooks: PropTypes.bool.isRequired,
            enableCommands: PropTypes.bool.isRequired,
            enableOAuthServiceProvider: PropTypes.bool.isRequired,
            enableOnlyAdminIntegrations: PropTypes.bool.isRequired,
        };
    }

    renderCustomEmoji() {
        if (!this.props.enableCustomEmoji || !Utils.canCreateCustomEmoji(this.props.user)) {
            return null;
        }

        return (
            <BackstageCategory
                name='emoji'
                parentLink={'/' + this.props.team.name}
                icon='fa-smile-o'
                title={
                    <FormattedMessage
                        id='backstage_sidebar.emoji'
                        defaultMessage='Custom Emoji'
                    />
                }
            />
        );
    }

    renderIntegrations() {
        const isSystemAdmin = Utils.isSystemAdmin(this.props.user.roles);
        if (!this.props.enableIncomingWebhooks &&
            !this.props.enableOutgoingWebhooks &&
            !this.props.enableCommands &&
            !this.props.enableOAuthServiceProvider) {
            return null;
        }

        if (this.props.enableOnlyAdminIntegrations &&
            !isSystemAdmin &&
            !TeamStore.isTeamAdmin(this.props.user.id, this.props.team.id)) {
            return null;
        }

        let incomingWebhooks = null;
        if (this.props.enableIncomingWebhooks) {
            incomingWebhooks = (
                <BackstageSection
                    name='incoming_webhooks'
                    title={(
                        <FormattedMessage
                            id='backstage_sidebar.integrations.incoming_webhooks'
                            defaultMessage='Incoming Webhooks'
                        />
                    )}
                />
            );
        }

        let outgoingWebhooks = null;
        if (this.props.enableOutgoingWebhooks) {
            outgoingWebhooks = (
                <BackstageSection
                    name='outgoing_webhooks'
                    title={(
                        <FormattedMessage
                            id='backstage_sidebar.integrations.outgoing_webhooks'
                            defaultMessage='Outgoing Webhooks'
                        />
                    )}
                />
            );
        }

        let commands = null;
        if (this.props.enableCommands) {
            commands = (
                <BackstageSection
                    name='commands'
                    title={(
                        <FormattedMessage
                            id='backstage_sidebar.integrations.commands'
                            defaultMessage='Slash Commands'
                        />
                    )}
                />
            );
        }

        let oauthApps = null;
        if (this.props.enableOAuthServiceProvider && (isSystemAdmin || !this.props.enableOnlyAdminIntegrations)) {
            oauthApps = (
                <BackstageSection
                    name='oauth2-apps'
                    title={
                        <FormattedMessage
                            id='backstage_sidebar.integrations.oauthApps'
                            defaultMessage='OAuth 2.0 Applications'
                        />
                    }
                />
            );
        }

        return (
            <BackstageCategory
                name='integrations'
                parentLink={'/' + this.props.team.name}
                icon='fa-link'
                title={
                    <FormattedMessage
                        id='backstage_sidebar.integrations'
                        defaultMessage='Integrations'
                    />
                }
            >
                {incomingWebhooks}
                {outgoingWebhooks}
                {commands}
                {oauthApps}
            </BackstageCategory>
        );
    }

    render() {
        return (
            <div className='backstage-sidebar'>
                <ul>
                    {this.renderCustomEmoji()}
                    {this.renderIntegrations()}
                </ul>
            </div>
        );
    }
}
