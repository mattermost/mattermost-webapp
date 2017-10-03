// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import ChannelMembersDropdown from 'components/channel_members_dropdown';
import MultiSelect from 'components/multiselect/multiselect.jsx';
import UserListRow from 'components/user_list_row.jsx';

import ChannelStore from 'stores/channel_store.jsx';
import UserStore from 'stores/user_store.jsx';
import TeamStore from 'stores/team_store.jsx';

import {
    searchUsers,
    loadProfilesAndTeamMembersAndChannelMembers,
    loadTeamMembersAndChannelMembersForProfilesList
} from 'actions/user_actions.jsx';

import Constants from 'utils/constants.jsx';

import PropTypes from 'prop-types';

import React from 'react';
import {FormattedMessage} from 'react-intl';

import store from 'stores/redux_store.jsx';
import {searchProfilesInCurrentChannel} from 'mattermost-redux/selectors/entities/users';

const USERS_PER_PAGE = 50;
const MAX_SELECTABLE_VALUES = 20;

export default class MemberListChannel extends React.Component {
    static propTypes = {
        isAdmin: PropTypes.bool,
        channel: PropTypes.object.isRequired,
        actions: PropTypes.shape({
            getChannelStats: PropTypes.func.isRequired
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

        const stats = ChannelStore.getCurrentStats();

        this.state = {
            users: UserStore.getProfileListInChannel(
                ChannelStore.getCurrentId(),
                false,
                true
            ),
            teamMembers: Object.assign({}, TeamStore.getMembersInTeam()),
            channelMembers: Object.assign(
                {},
                ChannelStore.getMembersInChannel()
            ),
            total: stats.member_count,
            loading: true,
            values: []
        };
    }

    componentDidMount() {
        UserStore.addInTeamChangeListener(this.onChange);
        UserStore.addStatusesChangeListener(this.onChange);
        TeamStore.addChangeListener(this.onChange);
        ChannelStore.addChangeListener(this.onChange);
        ChannelStore.addStatsChangeListener(this.onStatsChange);

        loadProfilesAndTeamMembersAndChannelMembers(
            0,
            Constants.PROFILE_CHUNK_SIZE,
            TeamStore.getCurrentId(),
            ChannelStore.getCurrentId(),
            this.loadComplete
        );
        this.props.actions.getChannelStats(ChannelStore.getCurrentId());
    }

    componentWillUnmount() {
        UserStore.removeInTeamChangeListener(this.onChange);
        UserStore.removeStatusesChangeListener(this.onChange);
        TeamStore.removeChangeListener(this.onChange);
        ChannelStore.removeChangeListener(this.onChange);
        ChannelStore.removeStatsChangeListener(this.onStatsChange);
    }

    loadComplete() {
        this.setState({loading: false});
    }

    onChange() {
        let users;
        if (this.term) {
            users = searchProfilesInCurrentChannel(store.getState(), this.term);
        } else {
            users = UserStore.getProfileListInChannel(
                ChannelStore.getCurrentId(),
                false,
                true
            );
        }

        this.setState({
            users,
            teamMembers: Object.assign({}, TeamStore.getMembersInTeam()),
            channelMembers: Object.assign(
                {},
                ChannelStore.getMembersInChannel()
            )
        });
    }

    onStatsChange() {
        const stats = ChannelStore.getCurrentStats();
        this.setState({total: stats.member_count});
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
            searchUsers(
                term,
                '',
                {in_channel_id: ChannelStore.getCurrentId()},
                (users) => {
                    if (searchTimeoutId !== this.searchTimeoutId) {
                        return;
                    }

                    this.setState({loading: true});

                    loadTeamMembersAndChannelMembersForProfilesList(
                        users,
                        TeamStore.getCurrentId(),
                        ChannelStore.getCurrentId(),
                        this.loadComplete
                    );
                }
            );
        }, Constants.SEARCH_TIMEOUT_MILLISECONDS);

        this.searchTimeoutId = searchTimeoutId;
    }

    handlePageChange(page, prevPage) {
        if (page > prevPage) {
            loadProfilesAndTeamMembersAndChannelMembers(
                page + 1,
                USERS_PER_PAGE
            );
        }
    }

    renderOption(option, isSelected) {
        const teamMembers = this.state.teamMembers;
        const channelMembers = this.state.channelMembers;
        const actionUserProps = {
            channel: this.props.channel,
            teamMember: teamMembers[option.id],
            channelMember: channelMembers[option.id]
        };

        return (
            <div
                key={option.id}
                ref={isSelected ? 'selected' : option.id}
            >
                <UserListRow
                    isSelected={isSelected}
                    user={option}
                    actions={[ChannelMembersDropdown]}
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
                key='viewManageChannelUsersKey'
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
