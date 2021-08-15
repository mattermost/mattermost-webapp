// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import SearchableUserList from 'components/searchable_user_list/searchable_user_list_container.jsx';
import TeamMembersDropdown from 'components/team_members_dropdown';
import {Teams} from 'mattermost-redux/constants';
import {ActionResult} from 'mattermost-redux/types/actions';
import {GetTeamMembersOpts, TeamMembership, TeamStats} from 'mattermost-redux/types/teams';
import {UserProfile} from 'mattermost-redux/types/users';
import {SearchModalFilters} from 'types/store/views';
import Constants from 'utils/constants';
import * as UserAgent from 'utils/user_agent';

const USERS_PER_PAGE = 50;

type Props = {
    actionUserProps: {
        [userId: string]: {
            teamMember: TeamMembership;
        };
    };
    searchTerm: string;
    users: UserProfile[];
    teamMembers: {
        [userId: string]: TeamMembership;
    };
    currentTeamId: string;
    totalTeamMembers: number;
    totalAdminsInTeam: number;
    canManageTeamMembers?: boolean;
    actions: {
        getTeamMembers: (teamId: string, page?: number, perPage?: number, options?: GetTeamMembersOpts) => Promise<{data: TeamMembership}>;
        searchProfiles: (term: string, options?: {[key: string]: any}) => Promise<{data: UserProfile[]}>;
        getTeamStats: (teamId: string) => Promise<{data: TeamStats}>;
        loadProfilesAndTeamMembers: (page: number, perPage: number, teamId?: string, options?: {[key: string]: any}) => Promise<{
            data: boolean;
        }>;
        loadStatusesForProfilesList: (users: UserProfile[]) => Promise<{
            data: boolean;
        }>;
        loadTeamMembersForProfilesList: (profiles: any, teamId: string, reloadAllMembers: boolean) => Promise<{
            data: boolean;
        }>;
        setModalSearchTerm: (term: string) => ActionResult;
        setModalFilters: (filters: SearchModalFilters) => void;
    };
}

type State = {
    loading: boolean;
    shouldShowOnlyAdminUsers: boolean;
}

export default class MemberListTeam extends React.PureComponent<Props, State> {
    private searchTimeoutId: number;

    constructor(props: Props) {
        super(props);

        this.searchTimeoutId = 0;

        this.state = {
            loading: true,
            shouldShowOnlyAdminUsers: false,
        };
    }

    async componentDidMount() {
        await Promise.all([
            this.props.actions.loadProfilesAndTeamMembers(0, Constants.PROFILE_CHUNK_SIZE, this.props.currentTeamId, {active: true}),
            this.props.actions.getTeamMembers(this.props.currentTeamId, 0, Constants.DEFAULT_MAX_USERS_PER_TEAM,
                {
                    sort: Teams.SORT_USERNAME_OPTION,
                    exclude_deleted_users: true,
                } as GetTeamMembersOpts,
            ),
            this.props.actions.getTeamStats(this.props.currentTeamId),
        ]);
        this.loadComplete();
    }

    componentWillUnmount() {
        this.props.actions.setModalSearchTerm('');
        this.props.actions.setModalFilters({});
        this.setState({shouldShowOnlyAdminUsers: false});
    }

    componentDidUpdate(prevProps: Props) {
        if (prevProps.searchTerm !== this.props.searchTerm) {
            clearTimeout(this.searchTimeoutId);

            const searchTerm = this.props.searchTerm;
            if (searchTerm === '') {
                this.loadComplete();
                this.searchTimeoutId = 0;
                return;
            }

            const searchTimeoutId = window.setTimeout(
                async () => {
                    const {
                        loadStatusesForProfilesList,
                        loadTeamMembersForProfilesList,
                        searchProfiles,
                    } = this.props.actions;
                    const {data} = await searchProfiles(searchTerm, {team_id: this.props.currentTeamId});

                    if (searchTimeoutId !== this.searchTimeoutId) {
                        return;
                    }

                    this.setState({loading: true});

                    loadStatusesForProfilesList(data);
                    loadTeamMembersForProfilesList(data, this.props.currentTeamId, true).then(({data: membersLoaded}) => {
                        if (membersLoaded) {
                            this.loadComplete();
                        }
                    });
                },
                Constants.SEARCH_TIMEOUT_MILLISECONDS,
            );

            this.searchTimeoutId = searchTimeoutId;
        }
    }

    loadComplete = () => {
        this.setState({loading: false});
    }

    nextPage = async (page: number) => {
        this.setState({loading: true});
        await Promise.all([
            this.props.actions.loadProfilesAndTeamMembers(page, USERS_PER_PAGE, this.props.currentTeamId, {active: true}),
            this.props.actions.getTeamMembers(this.props.currentTeamId, page, Constants.DEFAULT_MAX_USERS_PER_TEAM,
                {
                    sort: Teams.SORT_USERNAME_OPTION,
                    exclude_deleted_users: true,
                } as GetTeamMembersOpts,
            ),
        ]);
        this.loadComplete();
    }

    search = (term: string) => {
        this.props.actions.setModalSearchTerm(term);
    }

    toggleShowOnlyAdminUsers= (shouldShowOnlyAdminUsers: boolean): void => {
        let filters = {};
        if (shouldShowOnlyAdminUsers) {
            filters = {
                roles: [Constants.PERMISSIONS_SYSTEM_ADMIN],
                team_roles: [Constants.PERMISSIONS_TEAM_ADMIN],
                channel_roles: [Constants.PERMISSIONS_CHANNEL_ADMIN],
            };
        }
        this.props.actions.setModalFilters(filters);
        this.setState({shouldShowOnlyAdminUsers});
    }

    render() {
        let teamMembersDropdown = null;
        if (this.props.canManageTeamMembers) {
            teamMembersDropdown = [TeamMembersDropdown];
        }

        const total = this.state.shouldShowOnlyAdminUsers ? this.props.totalAdminsInTeam : this.props.totalTeamMembers;

        return (
            <SearchableUserList
                users={this.props.users}
                usersPerPage={USERS_PER_PAGE}
                total={total}
                nextPage={this.nextPage}
                search={this.search}
                actions={teamMembersDropdown}
                actionUserProps={this.props.actionUserProps}
                focusOnMount={!UserAgent.isMobile()}
                canFilterUsersByRole={true}
                shouldShowOnlyAdminUsers={this.state.shouldShowOnlyAdminUsers}
                toggleShowOnlyAdminUsers={this.toggleShowOnlyAdminUsers}
            />
        );
    }
}
