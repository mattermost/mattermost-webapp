// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import $ from 'jquery';

import PropTypes from 'prop-types';
import React from 'react';
import ReactDOM from 'react-dom';
import {defineMessages, FormattedMessage, injectIntl, intlShape} from 'react-intl';

import * as UserAgent from 'utils/user_agent.jsx';

import UserList from './user_list.jsx';

const holders = defineMessages({
    member: {
        id: 'filtered_user_list.member',
        defaultMessage: 'Member'
    },
    search: {
        id: 'filtered_user_list.search',
        defaultMessage: 'Search members'
    },
    anyTeam: {
        id: 'filtered_user_list.any_team',
        defaultMessage: 'All Users'
    },
    teamOnly: {
        id: 'filtered_user_list.team_only',
        defaultMessage: 'Members of this Team'
    }
});

class FilteredUserList extends React.Component {
    constructor(props) {
        super(props);

        this.handleFilterChange = this.handleFilterChange.bind(this);
        this.handleListChange = this.handleListChange.bind(this);
        this.filterUsers = this.filterUsers.bind(this);

        this.state = {
            filter: '',
            users: this.filterUsers(props.teamMembers, props.users),
            selected: 'team',
            teamMembers: props.teamMembers
        };
    }

    componentWillReceiveProps(nextProps) {
        // assume the user list is immutable
        if (this.props.users !== nextProps.users) {
            this.setState({
                users: this.filterUsers(nextProps.teamMembers, nextProps.users)
            });
        }

        if (this.props.teamMembers !== nextProps.teamMembers) {
            this.setState({
                users: this.filterUsers(nextProps.teamMembers, nextProps.users)
            });
        }
    }

    componentDidMount() {
        // only focus the search box on desktop so that we don't cause the keyboard to open on mobile
        if (!UserAgent.isMobile()) {
            ReactDOM.findDOMNode(this.refs.filter).focus();
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.filter !== this.state.filter) {
            $(ReactDOM.findDOMNode(this.refs.userList)).scrollTop(0);
        }
    }

    filterUsers(teamMembers, users) {
        if (!teamMembers || teamMembers.length === 0) {
            return users;
        }

        var filteredUsers = users.filter((user) => {
            for (const index in teamMembers) {
                if (teamMembers.hasOwnProperty(index) && teamMembers[index].user_id === user.id) {
                    if (teamMembers[index].delete_at > 0) {
                        return false;
                    }

                    return true;
                }
            }

            return false;
        });

        return filteredUsers;
    }

    handleFilterChange(e) {
        this.setState({
            filter: e.target.value
        });
    }

    handleListChange(e) {
        var users = this.props.users;

        if (e.target.value === 'team') {
            users = this.filterUsers(this.props.teamMembers, this.props.users);
        }

        this.setState({
            selected: e.target.value,
            users
        });
    }

    render() {
        const {formatMessage} = this.props.intl;

        let users = this.state.users;

        if (this.state.filter && this.state.filter.length > 0) {
            const filter = this.state.filter.toLowerCase();

            users = users.filter((user) => {
                return user.username.toLowerCase().indexOf(filter) !== -1 ||
                    (user.first_name && user.first_name.toLowerCase().indexOf(filter) !== -1) ||
                    (user.last_name && user.last_name.toLowerCase().indexOf(filter) !== -1) ||
                    (user.email && user.email.toLowerCase().indexOf(filter) !== -1) ||
                    (user.nickname && user.nickname.toLowerCase().indexOf(filter) !== -1);
            });
        }

        let count;
        if (users.length === this.state.users.length) {
            count = (
                <FormattedMessage
                    id='filtered_user_list.count'
                    defaultMessage='{count, number} {count, plural, one {member} other {members}}'
                    values={{
                        count: users.length
                    }}
                />
            );
        } else {
            count = (
                <FormattedMessage
                    id='filtered_user_list.countTotal'
                    defaultMessage='{count, number} {count, plural, one {member} other {members}} of {total, number} total'
                    values={{
                        count: users.length,
                        total: this.state.users.length
                    }}
                />
            );
        }

        let teamToggle;

        let teamMembers = this.props.teamMembers;
        if (this.props.showTeamToggle) {
            teamMembers = [];

            teamToggle = (
                <div className='member-select__container'>
                    <select
                        className='form-control'
                        id='restrictList'
                        ref='restrictList'
                        defaultValue='team'
                        onChange={this.handleListChange}
                    >
                        <option value='any'>{formatMessage(holders.anyTeam)}</option>
                        <option value='team'>{formatMessage(holders.teamOnly)}</option>
                    </select>
                    <span
                        className='member-show'
                    >
                        <FormattedMessage
                            id='filtered_user_list.show'
                            defaultMessage='Filter:'
                        />
                    </span>
                </div>
            );
        }

        return (
            <div
                className='filtered-user-list'
                style={this.props.style}
            >
                <div className='filter-row'>
                    <div className='col-sm-6'>
                        <input
                            ref='filter'
                            className='form-control filter-textbox'
                            placeholder={formatMessage(holders.search)}
                            onInput={this.handleFilterChange}
                        />
                    </div>
                    <div className='col-sm-6'>
                        {teamToggle}
                    </div>
                    <div className='col-sm-12'>
                        <span className='member-count pull-left'>{count}</span>
                    </div>
                </div>
                <div
                    ref='userList'
                    className='more-modal__list'
                >
                    <UserList
                        users={users}
                        teamMembers={teamMembers}
                        actions={this.props.actions}
                        actionProps={this.props.actionProps}
                    />
                </div>
            </div>
        );
    }
}

FilteredUserList.defaultProps = {
    users: [],
    teamMembers: [],
    actions: [],
    actionProps: {},
    showTeamToggle: false
};

FilteredUserList.propTypes = {
    intl: intlShape.isRequired,
    users: PropTypes.arrayOf(PropTypes.object),
    teamMembers: PropTypes.arrayOf(PropTypes.object),
    actions: PropTypes.arrayOf(PropTypes.func),
    actionProps: PropTypes.object,
    showTeamToggle: PropTypes.bool,
    style: PropTypes.object
};

export default injectIntl(FilteredUserList);
