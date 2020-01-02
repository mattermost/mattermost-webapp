// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {getTeamStats} from 'mattermost-redux/actions/teams';
import {searchProfiles} from 'mattermost-redux/actions/users';

import Constants from 'utils/constants';
import * as UserAgent from 'utils/user_agent';

import SearchableUserList from 'components/searchable_user_list/searchable_user_list_container.jsx';
import TeamMembersDropdown from 'components/team_members_dropdown';

import {loadStatusesForProfilesList} from 'actions/status_actions.jsx';
import {loadProfilesAndTeamMembers, loadTeamMembersForProfilesList} from 'actions/user_actions.jsx';
import {setModalSearchTerm} from 'actions/views/search';

const USERS_PER_PAGE = 50;

type Props = {
    searchTerm: string;
    users: Array<any>;
    teamMembers: any;
    currentTeamId: string;
    totalTeamMembers: number;
    canManageTeamMembers?: boolean;
    actions: {
        searchProfiles: typeof searchProfiles;
        getTeamStats: typeof getTeamStats;
        loadProfilesAndTeamMembers: typeof loadProfilesAndTeamMembers;
        loadStatusesForProfilesList: typeof loadStatusesForProfilesList;
        loadTeamMembersForProfilesList: typeof loadTeamMembersForProfilesList;
        setModalSearchTerm: typeof setModalSearchTerm;
    };
}

type State = {
    loading: boolean;
}

export default class MemberListTeam extends React.Component<Props, State> {
    private searchTimeoutId: number;

    constructor(props: Props) {
        super(props);

        this.searchTimeoutId = 0;

        this.state = {
            loading: true,
        };
    }

    componentDidMount() {
        (this.props.actions.loadProfilesAndTeamMembers(0, Constants.PROFILE_CHUNK_SIZE, this.props.currentTeamId) as any).then((result: any) => {
            if (result.data) {
                this.loadComplete();
            }
        });

        this.props.actions.getTeamStats(this.props.currentTeamId);
    }

    componentWillUnmount() {
        this.props.actions.setModalSearchTerm('');
    }

    UNSAFE_componentWillReceiveProps(nextProps: Props) { // eslint-disable-line camelcase
        if (this.props.searchTerm !== nextProps.searchTerm) {
            clearTimeout(this.searchTimeoutId);

            const searchTerm = nextProps.searchTerm;
            if (searchTerm === '') {
                this.loadComplete();
                this.searchTimeoutId = 0;
                return;
            }

            const searchTimeoutId = window.setTimeout(
                async () => {
                    const profilesResult: any = await nextProps.actions.searchProfiles(searchTerm, {team_id: nextProps.currentTeamId});

                    if (searchTimeoutId !== this.searchTimeoutId) {
                        return;
                    }

                    this.setState({loading: true});

                    nextProps.actions.loadStatusesForProfilesList(profilesResult.data);
                    (nextProps.actions.loadTeamMembersForProfilesList(profilesResult.data, nextProps.currentTeamId) as any).then((teamMembersProfiles: any) => {
                        if (teamMembersProfiles.data) {
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

    nextPage = (page: number) => {
        this.props.actions.loadProfilesAndTeamMembers(page + 1, USERS_PER_PAGE);
    }

    search = (term: string) => {
        this.props.actions.setModalSearchTerm(term);
    }

    render() {
        let teamMembersDropdown = null;
        if (this.props.canManageTeamMembers) {
            teamMembersDropdown = [TeamMembersDropdown];
        }

        const teamMembers = this.props.teamMembers;
        const users = this.props.users;
        const actionUserProps: {
            [key: string]: {
                teamMember: {};
            };
        } = {};

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
