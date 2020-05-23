// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';

import {Permissions} from 'mattermost-redux/constants';

import SystemPermissionGate from 'components/permissions_gates/system_permission_gate';
import TeamPermissionGate from 'components/permissions_gates/team_permission_gate';

import BackstageCategory from './backstage_category.jsx';
import BackstageSection from './backstage_section.jsx';

export default class BackstageSidebar extends React.PureComponent {
    static get propTypes() {
        return {
            team: PropTypes.object.isRequired,
            user: PropTypes.object.isRequired,
            enableCustomEmoji: PropTypes.bool.isRequired,
            enableIncomingWebhooks: PropTypes.bool.isRequired,
            enableOutgoingWebhooks: PropTypes.bool.isRequired,
            enableCommands: PropTypes.bool.isRequired,
            enableOAuthServiceProvider: PropTypes.bool.isRequired,
            canCreateOrDeleteCustomEmoji: PropTypes.bool.isRequired,
            canManageIntegrations: PropTypes.bool.isRequired,
        };
    }

    renderCustomEmoji() {
        if (!this.props.enableCustomEmoji || !this.props.canCreateOrDeleteCustomEmoji) {
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
        if (!this.props.canManageIntegrations) {
            return null;
        }

        let incomingWebhooks = null;
        if (this.props.enableIncomingWebhooks) {
            incomingWebhooks = (
                <TeamPermissionGate
                    permissions={[Permissions.MANAGE_INCOMING_WEBHOOKS]}
                    teamId={this.props.team.id}
                >
                    <BackstageSection
                        name='incoming_webhooks'
                        parentLink={'/' + this.props.team.name + '/integrations'}
                        title={(
                            <FormattedMessage
                                id='backstage_sidebar.integrations.incoming_webhooks'
                                defaultMessage='Incoming Webhooks'
                            />
                        )}
                        id='incomingWebhooks'
                    />
                </TeamPermissionGate>
            );
        }

        let outgoingWebhooks = null;
        if (this.props.enableOutgoingWebhooks) {
            outgoingWebhooks = (
                <TeamPermissionGate
                    permissions={[Permissions.MANAGE_OUTGOING_WEBHOOKS]}
                    teamId={this.props.team.id}
                >
                    <BackstageSection
                        name='outgoing_webhooks'
                        parentLink={'/' + this.props.team.name + '/integrations'}
                        title={(
                            <FormattedMessage
                                id='backstage_sidebar.integrations.outgoing_webhooks'
                                defaultMessage='Outgoing Webhooks'
                            />
                        )}
                        id='outgoingWebhooks'
                    />
                </TeamPermissionGate>
            );
        }

        let commands = null;
        if (this.props.enableCommands) {
            commands = (
                <TeamPermissionGate
                    permissions={[Permissions.MANAGE_SLASH_COMMANDS]}
                    teamId={this.props.team.id}
                >
                    <BackstageSection
                        name='commands'
                        parentLink={'/' + this.props.team.name + '/integrations'}
                        title={(
                            <FormattedMessage
                                id='backstage_sidebar.integrations.commands'
                                defaultMessage='Slash Commands'
                            />
                        )}
                        id='slashCommands'
                    />
                </TeamPermissionGate>
            );
        }

        let oauthApps = null;
        if (this.props.enableOAuthServiceProvider) {
            oauthApps = (
                <SystemPermissionGate permissions={[Permissions.MANAGE_OAUTH]}>
                    <BackstageSection
                        name='oauth2-apps'
                        parentLink={'/' + this.props.team.name + '/integrations'}
                        title={
                            <FormattedMessage
                                id='backstage_sidebar.integrations.oauthApps'
                                defaultMessage='OAuth 2.0 Applications'
                            />
                        }
                        id='oauthApps'
                    />
                </SystemPermissionGate>
            );
        }

        // Note that we allow managing bot accounts even if bot account creation is disabled: only
        // a permissions check is required.
        const botAccounts = (
            <SystemPermissionGate permissions={['manage_bots', 'manage_others_bots']}>
                <BackstageSection
                    name='bots'
                    parentLink={'/' + this.props.team.name + '/integrations'}
                    title={
                        <FormattedMessage
                            id='backstage_sidebar.bots'
                            defaultMessage='Bot Accounts'
                        />
                    }
                    id='botAccounts'
                />
            </SystemPermissionGate>
        );

        return (
            <BackstageCategory
                name='integrations'
                icon='fa-link'
                parentLink={'/' + this.props.team.name}
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
                {botAccounts}
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
