// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import Constants from 'utils/constants.jsx';
import * as UserAgent from 'utils/user_agent.jsx';

import SearchableUserList from 'components/searchable_user_list/searchable_user_list_container.jsx';
import TeamMembersDropdown from 'components/team_members_dropdown';

const USERS_PER_PAGE = 50;

export default class MemberListTeam extends React.Component {
    static propTypes = {
        searchTerm: PropTypes.string.isRequired,
        users: PropTypes.arrayOf(PropTypes.object).isRequired,
        teamMembers: PropTypes.object.isRequired,
        currentTeamId: PropTypes.string.isRequired,
        totalTeamMembers: PropTypes.number.isRequired,
        canManageTeamMembers: PropTypes.bool,
        actions: PropTypes.shape({
            searchProfiles: PropTypes.func.isRequired,
            getTeamStats: PropTypes.func.isRequired,
            loadProfilesAndTeamMembers: PropTypes.func.isRequired,
            loadStatusesForProfilesList: PropTypes.func.isRequired,
            loadTeamMembersForProfilesList: PropTypes.func.isRequired,
            setModalSearchTerm: PropTypes.func.isRequired,
        }).isRequired,
    }

    constructor(props) {
        super(props);

        this.searchTimeoutId = 0;

        this.state = {
            loading: true,
        };
    }

    componentDidMount() {
        this.props.actions.loadProfilesAndTeamMembers(0, Constants.PROFILE_CHUNK_SIZE, this.props.currentTeamId).then(({data}) => {
            if (data) {
                this.loadComplete();
            }
        });

        this.props.actions.getTeamStats(this.props.currentTeamId);
    }

    componentWillUnmount() {
        this.props.actions.setModalSearchTerm('');
    }

    UNSAFE_componentWillReceiveProps(nextProps) { // eslint-disable-line camelcase
        if (this.props.searchTerm !== nextProps.searchTerm) {
            clearTimeout(this.searchTimeoutId);

            const searchTerm = nextProps.searchTerm;
            if (searchTerm === '') {
                this.loadComplete();
                this.searchTimeoutId = '';
                return;
            }

            const searchTimeoutId = setTimeout(
                async () => {
                    const {
                        loadStatusesForProfilesList,
                        loadTeamMembersForProfilesList,
                        searchProfiles,
                    } = nextProps.actions;
                    const {data} = await searchProfiles(searchTerm, {team_id: nextProps.currentTeamId});

                    if (searchTimeoutId !== this.searchTimeoutId) {
                        return;
                    }

                    this.setState({loading: true});

                    loadStatusesForProfilesList(data);
                    loadTeamMembersForProfilesList(data, nextProps.currentTeamId).then(({data: membersLoaded}) => {
                        if (membersLoaded) {
                            this.loadComplete();
                        }
                    });
                },
                Constants.SEARCH_TIMEOUT_MILLISECONDS
            );

            this.searchTimeoutId = searchTimeoutId;
        }
    }

    loadComplete = () => {
        this.setState({loading: false});
    }

    nextPage = (page) => {
        this.props.actions.loadProfilesAndTeamMembers(page + 1, USERS_PER_PAGE);
    }

    search = (term) => {
        this.props.actions.setModalSearchTerm(term);
    }

    render() {
        let teamMembersDropdown = null;
        if (this.props.canManageTeamMembers) {
            teamMembersDropdown = [TeamMembersDropdown];
        }

        const teamMembers = this.props.teamMembers;
        const users = this.props.users;
        const actionUserProps = {};

        let usersToDisplay;
        if (this.state.loading) {
            usersToDisplay = null;
        } else {
            usersToDisplay = [];

            for (let i = 0; i < users.length; i++) {
                const user = users[i];

                if (teamMembers[user.id] && user.delete_at === 0) {
                    usersToDisplay.push(user);
                    actionUserProps[user.id] = {
                        teamMember: teamMembers[user.id],
                    };
                }
            }
        }

        return (
            <SearchableUserList
                users={usersToDisplay}
                usersPerPage={USERS_PER_PAGE}
                total={this.props.totalTeamMembers}
                nextPage={this.nextPage}
                search={this.search}
                actions={teamMembersDropdown}
                actionUserProps={actionUserProps}
                focusOnMount={!UserAgent.isMobile()}
            />
        );
    }
}
