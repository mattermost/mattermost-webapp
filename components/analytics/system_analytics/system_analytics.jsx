// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';
import PropTypes from 'prop-types';

import * as AdminActions from 'actions/admin_actions.jsx';
import AnalyticsStore from 'stores/analytics_store.jsx';
import Constants from 'utils/constants.jsx';
import * as Utils from 'utils/utils.jsx';

import FormattedMarkdownMessage from 'components/formatted_markdown_message.jsx';

import DoughnutChart from '../doughnut_chart.jsx';
import LineChart from '../line_chart.jsx';
import StatisticCount from '../statistic_count.jsx';

import {
    formatPostsPerDayData,
    formatUsersWithPostsPerDayData,
    formatChannelDoughtnutData,
    formatPostDoughtnutData,
} from '../format.jsx';

const StatTypes = Constants.StatTypes;

export default class SystemAnalytics extends React.Component {
    static propTypes = {
        isLicensed: PropTypes.bool.isRequired,
    }

    constructor(props) {
        super(props);

        this.state = {stats: AnalyticsStore.getAllSystem()};
    }

    componentDidMount() {
        AnalyticsStore.addChangeListener(this.onChange);

        AdminActions.getStandardAnalytics();
        AdminActions.getPostsPerDayAnalytics();
        AdminActions.getUsersPerDayAnalytics();

        if (this.props.isLicensed) {
            AdminActions.getAdvancedAnalytics();
        }
    }

    componentWillUnmount() {
        AnalyticsStore.removeChangeListener(this.onChange);
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (!Utils.areObjectsEqual(nextState.stats, this.state.stats)) {
            return true;
        }

        return false;
    }

    onChange = () => {
        this.setState({stats: AnalyticsStore.getAllSystem()});
    }

    render() {
        const stats = this.state.stats;
        const isLicensed = this.props.isLicensed;
        const skippedIntensiveQueries = stats[StatTypes.TOTAL_POSTS] === -1;
        const postCountsDay = formatPostsPerDayData(stats[StatTypes.POST_PER_DAY]);
        const userCountsWithPostsDay = formatUsersWithPostsPerDayData(stats[StatTypes.USERS_WITH_POSTS_PER_DAY]);

        let banner;
        let postCount;
        let postTotalGraph;
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

            postTotalGraph = (
                <div className='row'>
                    <LineChart
                        title={
                            <FormattedMessage
                                id='analytics.system.totalPosts'
                                defaultMessage='Total Posts'
                            />
                        }
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
                <h3 className='admin-console-header'>
                    <FormattedMessage
                        id='analytics.system.title'
                        defaultMessage='System Statistics'
                    />
                </h3>
                {banner}
                <div className='row'>
                    {firstRow}
                    {secondRow}
                    {thirdRow}
                    {advancedStats}
                </div>
                {advancedGraphs}
                {postTotalGraph}
                {activeUserGraph}
            </div>
        );
    }
}
