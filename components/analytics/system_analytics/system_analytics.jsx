// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';
import PropTypes from 'prop-types';

import * as AdminActions from 'actions/admin_actions.jsx';
import Constants from 'utils/constants';

import FormattedMarkdownMessage from 'components/formatted_markdown_message.jsx';

import FormattedAdminHeader from 'components/widgets/admin_console/formatted_admin_header';

import DoughnutChart from '../doughnut_chart';
import LineChart from '../line_chart';
import StatisticCount from '../statistic_count';

import {
    formatPostsPerDayData,
    formatUsersWithPostsPerDayData,
    formatChannelDoughtnutData,
    formatPostDoughtnutData,
    synchronizeChartLabels,
} from '../format';

const StatTypes = Constants.StatTypes;

export default class SystemAnalytics extends React.PureComponent {
    static propTypes = {
        isLicensed: PropTypes.bool.isRequired,
        stats: PropTypes.object,
    }

    componentDidMount() {
        AdminActions.getStandardAnalytics();
        AdminActions.getPostsPerDayAnalytics();
        AdminActions.getBotPostsPerDayAnalytics();
        AdminActions.getUsersPerDayAnalytics();

        if (this.props.isLicensed) {
            AdminActions.getAdvancedAnalytics();
        }
    }

    render() {
        const stats = this.props.stats;
        const isLicensed = this.props.isLicensed;
        const skippedIntensiveQueries = stats[StatTypes.TOTAL_POSTS] === -1;

        const labels = synchronizeChartLabels(stats[StatTypes.POST_PER_DAY], stats[StatTypes.BOT_POST_PER_DAY], stats[StatTypes.USERS_WITH_POSTS_PER_DAY]);
        const postCountsDay = formatPostsPerDayData(labels, stats[StatTypes.POST_PER_DAY]);
        const botPostCountsDay = formatPostsPerDayData(labels, stats[StatTypes.BOT_POST_PER_DAY]);
        const userCountsWithPostsDay = formatUsersWithPostsPerDayData(labels, stats[StatTypes.USERS_WITH_POSTS_PER_DAY]);

        let banner;
        let postCount;
        let postTotalGraph;
        let botPostTotalGraph;
        let activeUserGraph;
        if (skippedIntensiveQueries) {
            banner = (
                <div className='banner'>
                    <div className='banner__content'>
                        <FormattedMarkdownMessage
                            id='analytics.system.skippedIntensiveQueries'
                            defaultMessage='To maximize performance, some statistics are disabled. You can [re-enable them in config.json](!https://docs.mattermost.com/administration/statistics.html).'
                        />
                    </div>
                </div>
            );
        } else {
            postCount = (
                <StatisticCount
                    id='totalPosts'
                    title={
                        <FormattedMessage
                            id='analytics.system.totalPosts'
                            defaultMessage='Total Posts'
                        />
                    }
                    icon='fa-comment'
                    count={stats[StatTypes.TOTAL_POSTS]}
                />
            );

            botPostTotalGraph = (
                <div className='row'>
                    <LineChart
                        title={
                            <FormattedMessage
                                id='analytics.system.totalBotPosts'
                                defaultMessage='Total Posts from Bots'
                            />
                        }
                        data={botPostCountsDay}
                        id='totalPostsFromBotsLineChart'
                        width={740}
                        height={225}
                    />
                </div>
            );

            postTotalGraph = (
                <div className='row'>
                    <LineChart
                        title={
                            <FormattedMessage
                                id='analytics.system.totalPosts'
                                defaultMessage='Total Posts'
                            />
                        }
                        id='totalPostsLineChart'
                        data={postCountsDay}
                        width={740}
                        height={225}
                    />
                </div>
            );

            activeUserGraph = (
                <div className='row'>
                    <LineChart
                        title={
                            <FormattedMessage
                                id='analytics.system.activeUsers'
                                defaultMessage='Active Users With Posts'
                            />
                        }
                        id='activeUsersWithPostsLineChart'
                        data={userCountsWithPostsDay}
                        width={740}
                        height={225}
                    />
                </div>
            );
        }

        let advancedStats;
        let advancedGraphs;
        let sessionCount;
        let commandCount;
        let incomingCount;
        let outgoingCount;
        if (this.props.isLicensed) {
            sessionCount = (
                <StatisticCount
                    id='totalSessions'
                    title={
                        <FormattedMessage
                            id='analytics.system.totalSessions'
                            defaultMessage='Total Sessions'
                        />
                    }
                    icon='fa-signal'
                    count={stats[StatTypes.TOTAL_SESSIONS]}
                />
            );

            commandCount = (
                <StatisticCount
                    id='totalCommands'
                    title={
                        <FormattedMessage
                            id='analytics.system.totalCommands'
                            defaultMessage='Total Commands'
                        />
                    }
                    icon='fa-terminal'
                    count={stats[StatTypes.TOTAL_COMMANDS]}
                />
            );

            incomingCount = (
                <StatisticCount
                    id='incomingWebhooks'
                    title={
                        <FormattedMessage
                            id='analytics.system.totalIncomingWebhooks'
                            defaultMessage='Incoming Webhooks'
                        />
                    }
                    icon='fa-arrow-down'
                    count={stats[StatTypes.TOTAL_IHOOKS]}
                />
            );

            outgoingCount = (
                <StatisticCount
                    id='outgoingWebhooks'
                    title={
                        <FormattedMessage
                            id='analytics.system.totalOutgoingWebhooks'
                            defaultMessage='Outgoing Webhooks'
                        />
                    }
                    icon='fa-arrow-up'
                    count={stats[StatTypes.TOTAL_OHOOKS]}
                />
            );

            advancedStats = (
                <div>
                    <StatisticCount
                        id='websocketConns'
                        title={
                            <FormattedMessage
                                id='analytics.system.totalWebsockets'
                                defaultMessage='WebSocket Conns'
                            />
                        }
                        icon='fa-user'
                        count={stats[StatTypes.TOTAL_WEBSOCKET_CONNECTIONS]}
                    />
                    <StatisticCount
                        id='masterDbConns'
                        title={
                            <FormattedMessage
                                id='analytics.system.totalMasterDbConnections'
                                defaultMessage='Master DB Conns'
                            />
                        }
                        icon='fa-terminal'
                        count={stats[StatTypes.TOTAL_MASTER_DB_CONNECTIONS]}
                    />
                    <StatisticCount
                        id='replicaDbConns'
                        title={
                            <FormattedMessage
                                id='analytics.system.totalReadDbConnections'
                                defaultMessage='Replica DB Conns'
                            />
                        }
                        icon='fa-terminal'
                        count={stats[StatTypes.TOTAL_READ_DB_CONNECTIONS]}
                    />
                </div>
            );

            const channelTypeData = formatChannelDoughtnutData(stats[StatTypes.TOTAL_PUBLIC_CHANNELS], stats[StatTypes.TOTAL_PRIVATE_GROUPS]);
            const postTypeData = formatPostDoughtnutData(stats[StatTypes.TOTAL_FILE_POSTS], stats[StatTypes.TOTAL_HASHTAG_POSTS], stats[StatTypes.TOTAL_POSTS]);

            let postTypeGraph;
            if (stats[StatTypes.TOTAL_POSTS] !== -1) {
                postTypeGraph = (
                    <DoughnutChart
                        title={
                            <FormattedMessage
                                id='analytics.system.postTypes'
                                defaultMessage='Posts, Files and Hashtags'
                            />
                        }
                        data={postTypeData}
                        width={300}
                        height={225}
                    />
                );
            }

            advancedGraphs = (
                <div className='row'>
                    <DoughnutChart
                        title={
                            <FormattedMessage
                                id='analytics.system.channelTypes'
                                defaultMessage='Channel Types'
                            />
                        }
                        data={channelTypeData}
                        width={300}
                        height={225}
                    />
                    {postTypeGraph}
                </div>
            );
        }

        const userCount = (
            <StatisticCount
                id='totalActiveUsers'
                title={
                    <FormattedMessage
                        id='analytics.system.totalUsers'
                        defaultMessage='Total Active Users'
                    />
                }
                icon='fa-user'
                count={stats[StatTypes.TOTAL_USERS]}
            />
        );

        const teamCount = (
            <StatisticCount
                id='totalTeams'
                title={
                    <FormattedMessage
                        id='analytics.system.totalTeams'
                        defaultMessage='Total Teams'
                    />
                }
                icon='fa-users'
                count={stats[StatTypes.TOTAL_TEAMS]}
            />
        );

        const channelCount = (
            <StatisticCount
                id='totalChannels'
                title={
                    <FormattedMessage
                        id='analytics.system.totalChannels'
                        defaultMessage='Total Channels'
                    />
                }
                icon='fa-globe'
                count={stats[StatTypes.TOTAL_PUBLIC_CHANNELS] + stats[StatTypes.TOTAL_PRIVATE_GROUPS]}
            />
        );

        const dailyActiveUsers = (
            <StatisticCount
                id='dailyActiveUsers'
                title={
                    <FormattedMessage
                        id='analytics.system.dailyActiveUsers'
                        defaultMessage='Daily Active Users'
                    />
                }
                icon='fa-users'
                count={stats[StatTypes.DAILY_ACTIVE_USERS]}
            />
        );

        const monthlyActiveUsers = (
            <StatisticCount
                id='monthlyActiveUsers'
                title={
                    <FormattedMessage
                        id='analytics.system.monthlyActiveUsers'
                        defaultMessage='Monthly Active Users'
                    />
                }
                icon='fa-users'
                count={stats[StatTypes.MONTHLY_ACTIVE_USERS]}
            />
        );

        let firstRow;
        let secondRow;
        if (isLicensed && skippedIntensiveQueries) {
            firstRow = (
                <div>
                    {userCount}
                    {teamCount}
                    {channelCount}
                    {sessionCount}
                </div>
            );

            secondRow = (
                <div>
                    {commandCount}
                    {incomingCount}
                    {outgoingCount}
                </div>
            );
        } else if (isLicensed && !skippedIntensiveQueries) {
            firstRow = (
                <div>
                    {userCount}
                    {teamCount}
                    {channelCount}
                    {postCount}
                </div>
            );

            secondRow = (
                <div>
                    {sessionCount}
                    {commandCount}
                    {incomingCount}
                    {outgoingCount}
                </div>
            );
        } else if (!isLicensed) {
            firstRow = (
                <div>
                    {userCount}
                    {teamCount}
                    {channelCount}
                    {postCount}
                </div>
            );
        }

        const thirdRow = (
            <div>
                {dailyActiveUsers}
                {monthlyActiveUsers}
            </div>
        );

        return (
            <div className='wrapper--fixed team_statistics'>
                <FormattedAdminHeader
                    id='analytics.system.title'
                    defaultMessage='System Statistics'
                />
                <div className='admin-console__wrapper'>
                    <div className='admin-console__content'>
                        {banner}
                        <div className='row'>
                            {firstRow}
                            {secondRow}
                            {thirdRow}
                            {advancedStats}
                        </div>
                        {advancedGraphs}
                        {postTotalGraph}
                        {botPostTotalGraph}
                        {activeUserGraph}
                    </div>
                </div>
            </div>
        );
    }
}
