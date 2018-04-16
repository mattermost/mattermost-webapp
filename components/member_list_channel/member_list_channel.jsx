// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import {searchProfilesInCurrentChannel} from 'mattermost-redux/selectors/entities/users';
import {sortByUsername} from 'mattermost-redux/utils/user_utils';

import {loadProfilesAndTeamMembersAndChannelMembers, loadTeamMembersAndChannelMembersForProfilesList, searchUsers} from 'actions/user_actions.jsx';
import ChannelStore from 'stores/channel_store.jsx';
import store from 'stores/redux_store.jsx';
import TeamStore from 'stores/team_store.jsx';
import UserStore from 'stores/user_store.jsx';

import Constants from 'utils/constants.jsx';
import * as UserAgent from 'utils/user_agent.jsx';
import * as Utils from 'utils/utils.jsx';

import ChannelMembersDropdown from 'components/channel_members_dropdown';
import SearchableUserList from 'components/searchable_user_list/searchable_user_list_container.jsx';

const USERS_PER_PAGE = 50;

export default class MemberListChannel extends React.Component {
    static propTypes = {
        channel: PropTypes.object.isRequired,
        actions: PropTypes.shape({
            getChannelStats: PropTypes.func.isRequired,
        }).isRequired,
    }

    constructor(props) {
        super(props);

        this.onChange = this.onChange.bind(this);
        this.onStatsChange = this.onStatsChange.bind(this);
        this.handleSearch = this.handleSearch.bind(this);
        this.loadComplete = this.loadComplete.bind(this);

        this.searchTimeoutId = 0;
        this.term = '';

        const stats = ChannelStore.getCurrentStats();

        this.state = {
            users: UserStore.getProfileListInChannel(ChannelStore.getCurrentId(), false, true),
            teamMembers: Object.assign({}, TeamStore.getMembersInTeam()),
            channelMembers: Object.assign({}, ChannelStore.getMembersInChannel()),
            total: stats.member_count,
            loading: true,
            actionUserProps: {},
            usersToDisplay: [],
        };
    }

    componentDidMount() {
        UserStore.addInChannelChangeListener(this.onChange);
        TeamStore.addChangeListener(this.onChange);
        ChannelStore.addChangeListener(this.onChange);
        ChannelStore.addStatsChangeListener(this.onStatsChange);

        loadProfilesAndTeamMembersAndChannelMembers(0, Constants.PROFILE_CHUNK_SIZE, TeamStore.getCurrentId(), ChannelStore.getCurrentId(), this.loadComplete);
        this.props.actions.getChannelStats(ChannelStore.getCurrentId());
    }

    componentWillUnmount() {
        UserStore.removeInTeamChangeListener(this.onChange);
        TeamStore.removeChangeListener(this.onChange);
        ChannelStore.removeChangeListener(this.onChange);
        ChannelStore.removeStatsChangeListener(this.onStatsChange);
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (nextState.loading !== this.state.loading) {
            return true;
        }

        if (nextState.total !== this.state.total) {
            return true;
        }

        if (!Utils.areObjectsEqual(nextState.usersToDisplay, this.state.usersToDisplay)) {
            return true;
        }

        if (!Utils.areObjectsEqual(nextState.actionUserProps, this.state.actionUserProps)) {
            return true;
        }

        return false;
    }

    componentWillUpdate(_, nextState) {
        if (!nextState.loading) {
            const {
                users,
                teamMembers,
                channelMembers,
            } = nextState;

            this.setUsersDisplayAndActionProps(users, teamMembers, channelMembers);
        }
    }

    setUsersDisplayAndActionProps(users, teamMembers, channelMembers) {
        const actionUserProps = {};
        const usersToDisplay = [];

        for (let i = 0; i < users.length; i++) {
            const user = users[i];

            if (teamMembers[user.id] && channelMembers[user.id] && user.delete_at === 0) {
                usersToDisplay.push(user);

                actionUserProps[user.id] = {
                    channel: this.props.channel,
                    teamMember: teamMembers[user.id],
                    channelMember: channelMembers[user.id],
                };
            }
        }

        this.setState({
            usersToDisplay: usersToDisplay.sort(sortByUsername),
            actionUserProps,
        });
    }

    loadComplete() {
        this.setState({loading: false});
    }

    onChange() {
        let users;
        if (this.term) {
            users = searchProfilesInCurrentChannel(store.getState(), this.term);
        } else {
            users = UserStore.getProfileListInChannel(ChannelStore.getCurrentId(), false, true);
        }

        const teamMembers = Object.assign({}, TeamStore.getMembersInTeam());
        const channelMembers = Object.assign({}, ChannelStore.getMembersInChannel());

        this.setState({
            users,
            teamMembers,
            channelMembers,
        });

        this.setUsersDisplayAndActionProps(users, teamMembers, channelMembers);
    }

    onStatsChange() {
        const stats = ChannelStore.getCurrentStats();
        this.setState({total: stats.member_count});
    }

    nextPage(page) {
        loadProfilesAndTeamMembersAndChannelMembers(page + 1, USERS_PER_PAGE);
    }

    handleSearch(term) {
        clearTimeout(this.searchTimeoutId);
        this.term = term;

        if (term === '') {
            this.setState({loading: false});
            this.searchTimeoutId = '';
            this.onChange();
            return;
        }

        const searchTimeoutId = setTimeout(
            () => {
                searchUsers(term, '', {in_channel_id: ChannelStore.getCurrentId()},
                    (users) => {
                        if (searchTimeoutId !== this.searchTimeoutId) {
                            return;
                        }

                        this.setState({loading: true});

                        loadTeamMembersAndChannelMembersForProfilesList(users, TeamStore.getCurrentId(), ChannelStore.getCurrentId(), this.loadComplete);
                    }
                );
            },
            Constants.SEARCH_TIMEOUT_MILLISECONDS
        );

        this.searchTimeoutId = searchTimeoutId;
    }

    render() {
        return (
            <SearchableUserList
                users={this.state.usersToDisplay}
                usersPerPage={USERS_PER_PAGE}
                total={this.state.total}
                nextPage={this.nextPage}
                search={this.handleSearch}
                actions={[ChannelMembersDropdown]}
                actionUserProps={this.state.actionUserProps}
                focusOnMount={!UserAgent.isMobile()}
            />
        );
    }
}
