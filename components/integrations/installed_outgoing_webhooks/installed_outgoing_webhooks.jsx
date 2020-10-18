// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';

import * as Utils from 'utils/utils.jsx';
import Constants from 'utils/constants';
import BackstageList from 'components/backstage/components/backstage_list.jsx';
import InstalledOutgoingWebhook, {matchesFilter} from 'components/integrations/installed_outgoing_webhook.jsx';
import FormattedMarkdownMessage from 'components/formatted_markdown_message';

export default class InstalledOutgoingWebhooks extends React.PureComponent {
    static propTypes = {

        /**
        *  Data used in passing down as props for webhook modifications
        */
        team: PropTypes.object,

        /**
        * Data used for checking if webhook is created by current user
        */
        user: PropTypes.object,

        /**
        *  Data used for checking modification privileges
        */
        canManageOthersWebhooks: PropTypes.bool,

        /**
        * Data used in passing down as props for showing webhook details
        */
        outgoingWebhooks: PropTypes.array,

        /**
        * Data used in sorting for displaying list and as props channel details
        */
        channels: PropTypes.object,

        /**
        *  Data used in passing down as props for webhook -created by label
        */
        users: PropTypes.object,

        /**
        *  Data used in passing as argument for loading webhooks
        */
        teamId: PropTypes.string,

        actions: PropTypes.shape({

            /**
            * The function to call for removing outgoingWebhook
            */
            removeOutgoingHook: PropTypes.func,

            /**
            * The function to call for outgoingWebhook List and for the status of api
            */
            loadOutgoingHooksAndProfilesForTeam: PropTypes.func,

            /**
            * The function to call for regeneration of webhook token
            */
            regenOutgoingHookToken: PropTypes.func,
        }),

        /**
        * Whether or not outgoing webhooks are enabled.
        */
        enableOutgoingWebhooks: PropTypes.bool,
    }

    constructor(props) {
        super(props);

        this.state = {
            loading: true,
        };
    }

    componentDidMount() {
        if (this.props.enableOutgoingWebhooks) {
            this.props.actions.loadOutgoingHooksAndProfilesForTeam(
                this.props.teamId,
                Constants.Integrations.START_PAGE_NUM,
                Constants.Integrations.PAGE_SIZE,
            ).then(
                () => this.setState({loading: false}),
            );
        }
    }

    regenOutgoingWebhookToken = (outgoingWebhook) => {
        this.props.actions.regenOutgoingHookToken(outgoingWebhook.id);
    }

    removeOutgoingHook = (outgoingWebhook) => {
        this.props.actions.removeOutgoingHook(outgoingWebhook.id);
    }

    outgoingWebhookCompare = (a, b) => {
        let displayNameA = a.display_name;
        if (!displayNameA) {
            const channelA = this.props.channels[a.channel_id];
            if (channelA) {
                displayNameA = channelA.display_name;
            } else {
                displayNameA = Utils.localizeMessage('installed_outgoing_webhooks.unknown_channel', 'A Private Webhook');
            }
        }

        let displayNameB = b.display_name;
        if (!displayNameB) {
            const channelB = this.props.channels[b.channel_id];
            if (channelB) {
                displayNameB = channelB.display_name;
            } else {
                displayNameB = Utils.localizeMessage('installed_outgoing_webhooks.unknown_channel', 'A Private Webhook');
            }
        }
        return displayNameA.localeCompare(displayNameB);
    }

    outgoingWebhooks = (filter) => this.props.outgoingWebhooks.
        sort(this.outgoingWebhookCompare).
        filter((outgoingWebhook) => matchesFilter(outgoingWebhook, this.props.channels[outgoingWebhook.channel_id], filter)).
        map((outgoingWebhook) => {
            const canChange = this.props.canManageOthersWebhooks || this.props.user.id === outgoingWebhook.creator_id;
            const channel = this.props.channels[outgoingWebhook.channel_id];
            return (
                <InstalledOutgoingWebhook
                    key={outgoingWebhook.id}
                    outgoingWebhook={outgoingWebhook}
                    onRegenToken={this.regenOutgoingWebhookToken}
                    onDelete={this.removeOutgoingHook}
                    creator={this.props.users[outgoingWebhook.creator_id] || {}}
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
                        id='installed_outgoing_webhooks.header'
                        defaultMessage='Installed Outgoing Webhooks'
                    />
                }
                addText={
                    <FormattedMessage
                        id='installed_outgoing_webhooks.add'
                        defaultMessage='Add Outgoing Webhook'
                    />
                }
                addLink={'/' + this.props.team.name + '/integrations/outgoing_webhooks/add'}
                addButtonId='addOutgoingWebhook'
                emptyText={
                    <FormattedMessage
                        id='installed_outgoing_webhooks.empty'
                        defaultMessage='No outgoing webhooks found'
                    />
                }
                emptyTextSearch={
                    <FormattedMarkdownMessage
                        id='installed_outgoing_webhooks.emptySearch'
                        defaultMessage='No outgoing webhooks match {searchTerm}'
                    />
                }
                helpText={
                    <FormattedMessage
                        id='installed_outgoing_webhooks.help'
                        defaultMessage='Use outgoing webhooks to connect external tools to Mattermost. {buildYourOwn} or visit the {appDirectory} to find self-hosted, third-party apps and integrations.'
                        values={{
                            buildYourOwn: (
                                <a
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    href='http://docs.mattermost.com/developer/webhooks-outgoing.html'
                                >
                                    <FormattedMessage
                                        id='installed_outgoing_webhooks.help.buildYourOwn'
                                        defaultMessage='Build your own'
                                    />
                                </a>
                            ),
                            appDirectory: (
                                <a
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    href='https://about.mattermost.com/default-app-directory/'
                                >
                                    <FormattedMessage
                                        id='installed_outgoing_webhooks.help.appDirectory'
                                        defaultMessage='App Directory'
                                    />
                                </a>
                            ),
                        }}
                    />
                }
                searchPlaceholder={Utils.localizeMessage('installed_outgoing_webhooks.search', 'Search Outgoing Webhooks')}
                loading={this.state.loading}
            >
                {(filter) => {
                    const children = this.outgoingWebhooks(filter);
                    return [children, children.length > 0];
                }}
            </BackstageList>
        );
    }
}
