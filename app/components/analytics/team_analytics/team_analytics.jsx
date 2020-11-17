// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedDate, FormattedMessage} from 'react-intl';
import {General} from 'mattermost-redux/constants';

import LoadingScreen from 'components/loading_screen';

import FormattedMarkdownMessage from 'components/formatted_markdown_message';

import * as AdminActions from 'actions/admin_actions';
import BrowserStore from 'stores/browser_store';
import {StatTypes} from 'utils/constants';
import Banner from 'components/admin_console/banner';
import LineChart from 'components/analytics/line_chart';
import StatisticCount from 'components/analytics/statistic_count';
import TableChart from 'components/analytics/table_chart';

import {getMonthLong} from 'utils/i18n';

import {formatPostsPerDayData, formatUsersWithPostsPerDayData} from '../format';

const LAST_ANALYTICS_TEAM = 'last_analytics_team';

export default class TeamAnalytics extends React.PureComponent {
    static propTypes = {

        /*
         * Array of team objects
         */
        teams: PropTypes.arrayOf(PropTypes.object).isRequired,

        /*
         * Initial team to load analytics for
         */
        initialTeam: PropTypes.object,

        /**
         * The locale of the current user
          */
        locale: PropTypes.string.isRequired,
        stats: PropTypes.object.isRequired,

        actions: PropTypes.shape({

            /*
             * Function to get teams
             */
            getTeams: PropTypes.func.isRequired,

            /*
             * Function to get users in a team
             */
            getProfilesInTeam: PropTypes.func.isRequired,
        }).isRequired,
    }

    constructor(props) {
        super(props);

        this.state = {
            team: props.initialTeam,
            recentlyActiveUsers: [],
            newUsers: [],
        };
    }

    componentDidMount() {
        if (this.state.team) {
            this.getData(this.state.team.id);
        }

        this.props.actions.getTeams(0, 1000);
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.state.team && prevState.team !== this.state.team) {
            this.getData(this.state.team.id);
        }
    }

    getData = async (id) => {
        AdminActions.getStandardAnalytics(id);
        AdminActions.getPostsPerDayAnalytics(id);
        AdminActions.getBotPostsPerDayAnalytics(id);
        AdminActions.getUsersPerDayAnalytics(id);
        const {data: recentlyActiveUsers} = await this.props.actions.getProfilesInTeam(id, 0, General.PROFILE_CHUNK_SIZE, 'last_activity_at');
        const {data: newUsers} = await this.props.actions.getProfilesInTeam(id, 0, General.PROFILE_CHUNK_SIZE, 'create_at');

        this.setState({
            recentlyActiveUsers,
            newUsers,
        });
    }

    handleTeamChange = (e) => {
        const teamId = e.target.value;

        let team;
        this.props.teams.forEach((t) => {
            if (t.id === teamId) {
                team = t;
            }
        });

        this.setState({
            team,
        });

        BrowserStore.setGlobalItem(LAST_ANALYTICS_TEAM, teamId);
    }

    render() {
        if (this.props.teams.length === 0 || !this.state.team || !this.props.stats[this.state.team.id]) {
            return <LoadingScreen/>;
        }

        if (this.state.team == null) {
            return (
                <Banner
                    description={
                        <FormattedMessage
                            id='analytics.team.noTeams'
                            defaultMessage='This server has no teams for which to view statistics.'
                        />
                    }
                />
            );
        }

        const stats = this.props.stats[this.state.team.id];
        const postCountsDay = formatPostsPerDayData(stats[StatTypes.POST_PER_DAY]);
        const userCountsWithPostsDay = formatUsersWithPostsPerDayData(stats[StatTypes.USERS_WITH_POSTS_PER_DAY]);

        let banner = (
            <div className='banner'>
                <div className='banner__content'>
                    <FormattedMessage
                        id='analytics.system.info'
                        defaultMessage='Use data for only the chosen team. Exclude posts in direct message channels that are not tied to a team.'
                    />
                </div>
            </div>
        );

        let totalPostsCount;
        let postTotalGraph;
        let userActiveGraph;
        if (stats[StatTypes.TOTAL_POSTS] === -1) {
            banner = (
                <div className='banner'>
                    <div className='banner__content'>
                        <FormattedMarkdownMessage
                            id='analytics.system.infoAndSkippedIntensiveQueries'
                            defaultMessage='Use data for only the chosen team. Exclude posts in direct message channels that are not tied to a team. \n \n To maximize performance, some statistics are disabled. You can [re-enable them in config.json](!https://docs.mattermost.com/administration/statistics.html).'
                        />
                    </div>
                </div>
            );
        } else {
            totalPostsCount = (
                <StatisticCount
                    title={
                        <FormattedMessage
                            id='analytics.team.totalPosts'
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
                        key={this.state.team.id}
                        title={
                            <FormattedMessage
                                id='analytics.team.totalPosts'
                                defaultMessage='Total Posts'
                            />
                        }
                        id='totalPosts'
                        data={postCountsDay}
                        width={740}
                        height={225}
                    />
                </div>
            );

            userActiveGraph = (
                <div className='row'>
                    <LineChart
                        key={this.state.team.id}
                        title={
                            <FormattedMessage
                                id='analytics.team.activeUsers'
                                defaultMessage='Active Users With Posts'
                            />
                        }
                        id='activeUsersWithPosts'
                        data={userCountsWithPostsDay}
                        width={740}
                        height={225}
                    />
                </div>
            );
        }

        const recentActiveUsers = formatRecentUsersData(this.state.recentlyActiveUsers, this.props.locale);
        const newlyCreatedUsers = formatNewUsersData(this.state.newUsers, this.props.locale);

        const teams = this.props.teams.sort((a, b) => {
            const aName = a.display_name.toUpperCase();
            const bName = b.display_name.toUpperCase();
            if (aName === bName) {
                return 0;
            }
            if (aName > bName) {
                return 1;
            }
            return -1;
        }).map((team) => {
            return (
                <option
                    key={team.id}
                    value={team.id}
                >
                    {team.display_name}
                </option>
            );
        });

        return (
            <div className='wrapper--fixed team_statistics'>
                <div className='admin-console__header team-statistics__header-row'>
                    <div className='team-statistics__header'>
                        <FormattedMarkdownMessage
                            id='analytics.team.title'
                            defaultMessage='Team Statistics for {team}'
                            values={{
                                team: this.state.team.display_name,
                            }}
                        />
                    </div>
                    <div className='team-statistics__team-filter'>
                        <select
                            data-testid='teamFilter'
                            className='form-control team-statistics__team-filter__dropdown'
                            onChange={this.handleTeamChange}
                            value={this.state.team.id}
                        >
                            {teams}
                        </select>
                    </div>
                </div>

                <div className='admin-console__wrapper'>
                    <div className='admin-console__content'>
                        {banner}
                        <div className='row'>
                            <StatisticCount
                                title={
                                    <FormattedMessage
                                        id='analytics.team.totalUsers'
                                        defaultMessage='Total Active Users'
                                    />
                                }
                                icon='fa-users'
                                count={stats[StatTypes.TOTAL_USERS]}
                            />
                            <StatisticCount
                                title={
                                    <FormattedMessage
                                        id='analytics.team.publicChannels'
                                        defaultMessage='Public Channels'
                                    />
                                }
                                icon='fa-globe'
                                count={stats[StatTypes.TOTAL_PUBLIC_CHANNELS]}
                            />
                            <StatisticCount
                                title={
                                    <FormattedMessage
                                        id='analytics.team.privateGroups'
                                        defaultMessage='Private Channels'
                                    />
                                }
                                icon='fa-lock'
                                count={stats[StatTypes.TOTAL_PRIVATE_GROUPS]}
                            />
                            {totalPostsCount}
                        </div>
                        {postTotalGraph}
                        {userActiveGraph}
                        <div className='row'>
                            <TableChart
                                title={
                                    <FormattedMessage
                                        id='analytics.team.recentUsers'
                                        defaultMessage='Recent Active Users'
                                    />
                                }
                                data={recentActiveUsers}
                            />
                            <TableChart
                                title={
                                    <FormattedMessage
                                        id='analytics.team.newlyCreated'
                                        defaultMessage='Newly Created Users'
                                    />
                                }
                                data={newlyCreatedUsers}
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export function formatRecentUsersData(data, locale) {
    if (data == null) {
        return [];
    }

    const formattedData = data.map((user) => {
        const item = {};
        item.name = user.username;
        item.value = (
            <FormattedDate
                value={user.last_activity_at}
                day='numeric'
                month={getMonthLong(locale)}
                year='numeric'
                hour12={true}
                hour='2-digit'
                minute='2-digit'
            />
        );
        item.tip = user.email;

        return item;
    });

    return formattedData;
}

export function formatNewUsersData(data, locale) {
    if (data == null) {
        return [];
    }

    const formattedData = data.map((user) => {
        const item = {};
        item.name = user.username;
        item.value = (
            <FormattedDate
                value={user.create_at}
                day='numeric'
                month={getMonthLong(locale)}
                year='numeric'
                hour12={true}
                hour='2-digit'
                minute='2-digit'
            />
        );
        item.tip = user.email;

        return item;
    });

    return formattedData;
}
