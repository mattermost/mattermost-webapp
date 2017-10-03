// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import TeamMembersDropdown from 'components/team_members_dropdown';
import MultiSelect from 'components/multiselect/multiselect.jsx';
import UserListRow from 'components/user_list_row.jsx';

import UserStore from 'stores/user_store.jsx';
import TeamStore from 'stores/team_store.jsx';

import {
    searchUsers,
    loadProfilesAndTeamMembers,
    loadTeamMembersForProfilesList
} from 'actions/user_actions.jsx';

import Constants from 'utils/constants.jsx';

import PropTypes from 'prop-types';

import React from 'react';
import {FormattedMessage} from 'react-intl';

import store from 'stores/redux_store.jsx';
import {searchProfilesInCurrentTeam} from 'mattermost-redux/selectors/entities/users';

const USERS_PER_PAGE = 50;
const MAX_SELECTABLE_VALUES = 20;

export default class MemberListTeam extends React.Component {
    static propTypes = {
        isAdmin: PropTypes.bool,
        actions: PropTypes.shape({
            getTeamStats: PropTypes.func.isRequired
        }).isRequired
    };

    constructor(props) {
        super(props);

        this.onChange = this.onChange.bind(this);
        this.onStatsChange = this.onStatsChange.bind(this);
        this.search = this.search.bind(this);
        this.loadComplete = this.loadComplete.bind(this);
        this.renderOption = this.renderOption.bind(this);

        this.searchTimeoutId = 0;
        this.term = '';

        const stats = TeamStore.getCurrentStats();

        this.state = {
            users: UserStore.getProfileListInTeam(),
            teamMembers: Object.assign([], TeamStore.getMembersInTeam()),
            total: stats.active_member_count,
            loading: true,
            values: []
        };
    }

    componentDidMount() {
        UserStore.addInTeamChangeListener(this.onChange);
        UserStore.addStatusesChangeListener(this.onChange);
        TeamStore.addChangeListener(this.onChange);
        TeamStore.addStatsChangeListener(this.onStatsChange);

        loadProfilesAndTeamMembers(
            0,
            Constants.PROFILE_CHUNK_SIZE,
            TeamStore.getCurrentId(),
            this.loadComplete
        );
        this.props.actions.getTeamStats(TeamStore.getCurrentId());
    }

    componentWillUnmount() {
        UserStore.removeInTeamChangeListener(this.onChange);
        UserStore.removeStatusesChangeListener(this.onChange);
        TeamStore.removeChangeListener(this.onChange);
        TeamStore.removeStatsChangeListener(this.onStatsChange);
    }

    loadComplete() {
        this.setState({loading: false});
    }

    onChange() {
        let users;
        if (this.term) {
            users = searchProfilesInCurrentTeam(store.getState(), this.term);
        } else {
            users = UserStore.getProfileListInTeam();
        }

        this.setState({
            users,
            teamMembers: Object.assign([], TeamStore.getMembersInTeam())
        });
    }

    onStatsChange() {
        const stats = TeamStore.getCurrentStats();
        this.setState({total: stats.active_member_count});
    }

    search(term) {
        clearTimeout(this.searchTimeoutId);
        this.term = term;

        if (term === '') {
            this.setState({loading: false});
            this.searchTimeoutId = '';
            this.onChange();
            return;
        }

        const searchTimeoutId = setTimeout(() => {
            searchUsers(term, TeamStore.getCurrentId(), {}, (users) => {
                if (searchTimeoutId !== this.searchTimeoutId) {
                    return;
                }
                this.setState({loading: true});
                loadTeamMembersForProfilesList(
                    users,
                    TeamStore.getCurrentId(),
                    this.loadComplete
                );
            });
        }, Constants.SEARCH_TIMEOUT_MILLISECONDS);

        this.searchTimeoutId = searchTimeoutId;
    }

    handlePageChange(page, prevPage) {
        if (page > prevPage) {
            loadProfilesAndTeamMembers(page + 1, USERS_PER_PAGE);
        }
    }

    renderOption(option, isSelected) {
        let teamMembersDropdown = null;
        if (this.props.isAdmin) {
            teamMembersDropdown = [TeamMembersDropdown];
        }
        const teamMembers = this.state.teamMembers;
        const actionUserProps = {
            teamMember: teamMembers[option.id]
        };

        return (
            <div
                key={option.id}
                ref={isSelected ? 'selected' : option.id}
            >
                <UserListRow
                    isSelected={isSelected}
                    user={option}
                    actions={teamMembersDropdown}
                    actionUserProps={actionUserProps}
                />
            </div>
        );
    }

    renderValue(user) {
        return user.username;
    }

    render() {
        const numRemainingText = (
            <FormattedMessage
                id='multiselect.numPeopleRemaining'
                defaultMessage='Use ↑↓ to browse, ↵ to select. You can add {num, number} more {num, plural, one {person} other {people}}. '
                values={{
                    num: MAX_SELECTABLE_VALUES - this.state.values.length
                }}
            />
        );

        const users = this.state.users;

        let usersToDisplay;
        if (this.state.loading) {
            usersToDisplay = null;
        } else {
            usersToDisplay = [];

            for (let i = 0; i < users.length; i++) {
                const user = Object.assign({}, users[i]);
                user.value = user.id;
                user.label = '@' + user.username;
                users[i] = user;

                if (user.delete_at === 0) {
                    usersToDisplay.push(user);
                }
            }
        }

        return (
            <MultiSelect
                key='viewManageUsersKey'
                options={usersToDisplay}
                optionRenderer={this.renderOption}
                values={this.state.values}
                valueRenderer={this.renderValue}
                perPage={USERS_PER_PAGE}
                handlePageChange={this.handlePageChange}
                handleInput={this.search}
                maxValues={MAX_SELECTABLE_VALUES}
                numRemainingText={numRemainingText}
                placeholderMessage='Search users'
                localizationKey='filtered_user_list.search'
            />
        );
    }
}
