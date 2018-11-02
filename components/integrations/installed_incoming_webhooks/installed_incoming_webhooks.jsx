// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';

import Constants from 'utils/constants.jsx';
import * as Utils from 'utils/utils.jsx';
import BackstageList from 'components/backstage/components/backstage_list.jsx';
import InstalledIncomingWebhook from 'components/integrations/installed_incoming_webhook.jsx';

export default class InstalledIncomingWebhooks extends React.PureComponent {
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
        incomingWebhooks: PropTypes.array,

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
            * The function to call for removing incomingWebhook
            */
            removeIncomingHook: PropTypes.func,

            /**
            * The function to call for incomingWebhook List and for the status of api
            */
            loadIncomingHooksAndProfilesForTeam: PropTypes.func,
        }),

        /**
        * Whether or not incoming webhooks are enabled.
        */
        enableIncomingWebhooks: PropTypes.bool,
    }

    constructor(props) {
        super(props);

        this.state = {
            loading: true,
        };
    }

    componentDidMount() {
        if (this.props.enableIncomingWebhooks) {
            this.props.actions.loadIncomingHooksAndProfilesForTeam(
                this.props.teamId,
                Constants.Integrations.START_PAGE_NUM,
                Constants.Integrations.PAGE_SIZE
            ).then(
                () => this.setState({loading: false})
            );
        }
    }

    deleteIncomingWebhook = (incomingWebhook) => {
        this.props.actions.removeIncomingHook(incomingWebhook.id);
    }

    incomingWebhookCompare = (a, b) => {
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

    render() {
        const incomingWebhooks = this.props.incomingWebhooks.sort(this.incomingWebhookCompare).map((incomingWebhook) => {
            const canChange = this.props.canManageOthersWebhooks || this.props.user.id === incomingWebhook.user_id;
            const channel = this.props.channels[incomingWebhook.channel_id];
            return (
                <InstalledIncomingWebhook
                    key={incomingWebhook.id}
                    incomingWebhook={incomingWebhook}
                    onDelete={this.deleteIncomingWebhook}
                    creator={this.props.users[incomingWebhook.user_id] || {}}
                    canChange={canChange}
                    team={this.props.team}
                    channel={channel}
                />
            );
        });

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
                emptyText={
                    <FormattedMessage
                        id='installed_incoming_webhooks.empty'
                        defaultMessage='No incoming webhooks found'
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
                                    href='http://docs.mattermost.com/developer/webhooks-incoming.html'
                                >
                                    <FormattedMessage
                                        id='installed_incoming_webhooks.help.buildYourOwn'
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
            >
                {incomingWebhooks}
            </BackstageList>
        );
    }
}
