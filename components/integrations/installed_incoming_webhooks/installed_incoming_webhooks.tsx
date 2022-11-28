// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import InstalledIncomingWebhook, {matchesFilter} from 'components/integrations/installed_incoming_webhook';

import {Team} from '@mattermost/types/teams';
import {Channel} from '@mattermost/types/channels';
import {IncomingWebhook} from '@mattermost/types/integrations';
import {ActionResult} from 'mattermost-redux/types/actions';
import {UserProfile} from '@mattermost/types/users';
import {IDMappedObjects} from '@mattermost/types/utilities';

import BackstageList from 'components/backstage/components/backstage_list';
import FormattedMarkdownMessage from 'components/formatted_markdown_message';

import * as Utils from 'utils/utils';

type Props = {
    team: Team;
    user: UserProfile;
    canManageOthersWebhooks: boolean;
    incomingWebhooks: IncomingWebhook[];
    channels: IDMappedObjects<Channel>;
    users: IDMappedObjects<UserProfile>;
    enableIncomingWebhooks: boolean;
    actions: {
        removeIncomingHook: (hookId: string) => Promise<ActionResult>;
        updateIncomingHook: (hook: IncomingWebhook) => Promise<ActionResult>;
        loadAllIncomingHooksAndProfilesForTeam: (teamId: string) => Promise<ActionResult>;
    };
}

type State = {
    loading: boolean;
    page: number;
}

export default class InstalledIncomingWebhooks extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            loading: true,
            page: 0,
        };
    }

    componentDidMount() {
        if (this.props.enableIncomingWebhooks) {
            this.props.actions.loadAllIncomingHooksAndProfilesForTeam(
                this.props.team.id,
            ).then(
                () => this.setState({loading: false}),
            );
        }
    }

    deleteIncomingWebhook = (incomingWebhook: IncomingWebhook) => {
        this.props.actions.removeIncomingHook(incomingWebhook.id);
    }

    toggleIncomingWebhook = (incomingWebhook: IncomingWebhook) => {
        this.props.actions.updateIncomingHook(incomingWebhook);
    }

    incomingWebhookCompare = (a: IncomingWebhook, b: IncomingWebhook) => {
        let displayNameA = a.display_name;
        if (!displayNameA) {
            const channelA = this.props.channels[a.channel_id];
            if (channelA) {
                displayNameA = channelA.display_name;
            } else {
                displayNameA = Utils.localizeMessage('installed_incoming_webhooks.unknown_channel', 'A Private Webhook');
            }
        }

        const displayNameB = b.display_name;

        return displayNameA.localeCompare(displayNameB);
    }

    nextPage = () => {
        this.setState({page: this.state.page + 1});
    }

    previousPage = () => {
        this.setState({page: this.state.page - 1});
    }

    incomingWebhooks = (filter: string) => this.props.incomingWebhooks.
        sort(this.incomingWebhookCompare).
        filter((incomingWebhook: IncomingWebhook) => matchesFilter(incomingWebhook, this.props.channels[incomingWebhook.channel_id], filter)).
        map((incomingWebhook: IncomingWebhook) => {
            const canChange = this.props.canManageOthersWebhooks || this.props.user.id === incomingWebhook.user_id;
            const channel = this.props.channels[incomingWebhook.channel_id];
            return (
                <InstalledIncomingWebhook
                    key={incomingWebhook.id}
                    incomingWebhook={incomingWebhook}
                    onDelete={this.deleteIncomingWebhook}
                    onToggle={this.toggleIncomingWebhook}
                    creator={this.props.users[incomingWebhook.user_id] || {}}
                    canChange={canChange}
                    team={this.props.team}
                    channel={channel}
                />
            );
        });

    render() {
        return (
            <BackstageList
                header={
                    <FormattedMessage
                        id='installed_incoming_webhooks.header'
                        defaultMessage='Installed Incoming Webhooks'
                    />
                }
                addText={
                    <FormattedMessage
                        id='installed_incoming_webhooks.add'
                        defaultMessage='Add Incoming Webhook'
                    />
                }
                addLink={'/' + this.props.team.name + '/integrations/incoming_webhooks/add'}
                addButtonId='addIncomingWebhook'
                emptyText={
                    <FormattedMessage
                        id='installed_incoming_webhooks.empty'
                        defaultMessage='No incoming webhooks found'
                    />
                }
                emptyTextSearch={
                    <FormattedMarkdownMessage
                        id='installed_incoming_webhooks.emptySearch'
                        defaultMessage='No incoming webhooks match {searchTerm}'
                    />
                }
                helpText={
                    <FormattedMessage
                        id='installed_incoming_webhooks.help'
                        defaultMessage='Use incoming webhooks to connect external tools to Mattermost. {buildYourOwn} or visit the {appDirectory} to find self-hosted, third-party apps and integrations.'
                        values={{
                            buildYourOwn: (
                                <a
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    href='https://developers.mattermost.com/integrate/admin-guide/admin-webhooks-incoming/'
                                >
                                    <FormattedMessage
                                        id='installed_incoming_webhooks.help.buildYourOwn'
                                        defaultMessage='Build Your Own'
                                    />
                                </a>
                            ),
                            appDirectory: (
                                <a
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    href='https://mattermost.com/marketplace'
                                >
                                    <FormattedMessage
                                        id='installed_incoming_webhooks.help.appDirectory'
                                        defaultMessage='App Directory'
                                    />
                                </a>
                            ),
                        }}
                    />
                }
                searchPlaceholder={Utils.localizeMessage('installed_incoming_webhooks.search', 'Search Incoming Webhooks')}
                loading={this.state.loading}
                nextPage={this.nextPage}
                previousPage={this.previousPage}
                page={this.state.page}
            >
                {(filter: string) => {
                    const children = this.incomingWebhooks(filter);
                    return [children, children.length > 0];
                }}
            </BackstageList>
        );
    }
}
