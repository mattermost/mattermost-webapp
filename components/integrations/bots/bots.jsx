// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';

import {getSiteURL} from 'utils/url';

import * as Utils from 'utils/utils.jsx';
import BackstageList from 'components/backstage/components/backstage_list.jsx';
import Constants from 'utils/constants';
import FormattedMarkdownMessage from 'components/formatted_markdown_message';

import Bot, {matchesFilter} from './bot.jsx';

export default class Bots extends React.PureComponent {
    static propTypes = {

        /**
        *  Map from botUserId to bot.
        */
        bots: PropTypes.object.isRequired,

        /**
        *  Map from botUserId to accessTokens.
        */
        accessTokens: PropTypes.object.isRequired,

        /**
        *  Map from botUserId to owner.
        */
        owners: PropTypes.object.isRequired,

        /**
        *  Map from botUserId to user.
        */
        users: PropTypes.object.isRequired,

        createBots: PropTypes.bool,

        actions: PropTypes.shape({

            /**
            * Ensure we have bot accounts
            */
            loadBots: PropTypes.func.isRequired,

            /**
            * Load access tokens for bot accounts
            */
            getUserAccessTokensForUser: PropTypes.func.isRequired,

            /**
            * Access token managment
            */
            createUserAccessToken: PropTypes.func.isRequired,
            revokeUserAccessToken: PropTypes.func.isRequired,
            enableUserAccessToken: PropTypes.func.isRequired,
            disableUserAccessToken: PropTypes.func.isRequired,

            /**
            * Load owner of bot account
            */
            getUser: PropTypes.func.isRequired,

            /**
            * Disable a bot
            */
            disableBot: PropTypes.func.isRequired,

            /**
            * Enable a bot
            */
            enableBot: PropTypes.func.isRequired,
        }),

        /**
        *  Only used for routing since backstage is team based.
        */
        team: PropTypes.object.isRequired,
    }

    constructor(props) {
        super(props);

        this.state = {
            loading: true,
        };
    }

    componentDidMount() {
        this.props.actions.loadBots(
            Constants.Integrations.START_PAGE_NUM,
            Constants.Integrations.PAGE_SIZE,
        ).then(
            (result) => {
                if (result.data) {
                    const promises = [];

                    for (const bot of result.data) {
                        // We don't need to wait for this and we need to accept failure in the case where bot.owner_id is a plugin id
                        this.props.actions.getUser(bot.owner_id);

                        // We want to wait for these.
                        promises.push(this.props.actions.getUser(bot.user_id));
                        promises.push(this.props.actions.getUserAccessTokensForUser(bot.user_id));
                    }

                    Promise.all(promises).then(() => {
                        this.setState({loading: false});
                    });
                }
            },
        );
    }

    DisabledSection(props) {
        if (!props.hasDisabled) {
            return null;
        }
        const botsToDisplay = React.Children.map(props.disabledBots, (child) => {
            return React.cloneElement(child, {filter: props.filter});
        });
        return (
            <React.Fragment>
                <div className='bot-disabled'>
                    <FormattedMessage
                        id='bots.disabled'
                        defaultMessage='Disabled'
                    />
                </div>
                <div className='bot-list__disabled'>
                    {botsToDisplay}
                </div>
            </React.Fragment>
        );
    }

    EnabledSection(props) {
        const botsToDisplay = React.Children.map(props.enabledBots, (child) => {
            return React.cloneElement(child, {filter: props.filter});
        });
        return (
            <div>
                {botsToDisplay}
            </div>
        );
    }

    botToJSX = (bot) => {
        return (
            <Bot
                key={bot.user_id}
                bot={bot}
                owner={this.props.owners[bot.user_id]}
                user={this.props.users[bot.user_id]}
                accessTokens={this.props.accessTokens[bot.user_id] || {}}
                actions={this.props.actions}
                team={this.props.team}
            />
        );
    };

    bots = (filter) => {
        const bots = Object.values(this.props.bots).sort((a, b) => a.username.localeCompare(b.username));
        const match = (bot) => matchesFilter(bot, filter, this.props.owners[bot.user_id]);
        const enabledBots = bots.filter((bot) => bot.delete_at === 0).filter(match).map(this.botToJSX);
        const disabledBots = bots.filter((bot) => bot.delete_at > 0).filter(match).map(this.botToJSX);
        const sections = (
            <div key='sections'>
                <this.EnabledSection
                    enabledBots={enabledBots}
                />
                <this.DisabledSection
                    hasDisabled={disabledBots.length > 0}
                    disabledBots={disabledBots}
                />
            </div>
        );

        return [sections, enabledBots.length > 0 || disabledBots.length > 0];
    }

    render() {
        return (
            <BackstageList
                header={
                    <FormattedMessage
                        id='bots.manage.header'
                        defaultMessage='Bot Accounts'
                    />
                }
                addText={this.props.createBots &&
                    <FormattedMessage
                        id='bots.manage.add'
                        defaultMessage='Add Bot Account'
                    />
                }
                addLink={'/' + this.props.team.name + '/integrations/bots/add'}
                addButtonId='addBotAccount'
                emptyText={
                    <FormattedMessage
                        id='bots.manage.empty'
                        defaultMessage='No bot accounts found'
                    />
                }
                emptyTextSearch={
                    <FormattedMarkdownMessage
                        id='bots.manage.emptySearch'
                        defaultMessage='No bot accounts match **{searchTerm}**'
                    />
                }
                helpText={
                    <React.Fragment>
                        <FormattedMessage
                            id='bots.manage.help1'
                            defaultMessage='Use {botAccounts} to integrate with Mattermost through plugins or the API. Bot accounts are available to everyone on your server. '
                            values={{
                                botAccounts: (
                                    <a
                                        target='_blank'
                                        rel='noopener noreferrer'
                                        href='https://mattermost.com/pl/default-bot-accounts'
                                    >
                                        <FormattedMessage
                                            id='bots.manage.bot_accounts'
                                            defaultMessage='Bot Accounts'
                                        />
                                    </a>
                                ),
                            }}
                        />
                        <FormattedMarkdownMessage
                            id='bots.manage.help2'
                            defaultMessage={'Enable bot account creation in the [System Console]({siteURL}/admin_console/integrations/bot_accounts).'}
                            values={{
                                siteURL: getSiteURL(),
                            }}
                        />
                    </React.Fragment>
                }
                searchPlaceholder={Utils.localizeMessage('bots.manage.search', 'Search Bot Accounts')}
                loading={this.state.loading}
            >
                {this.bots}
            </BackstageList>
        );
    }
}
