// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import {Dictionary} from 'mattermost-redux/types/utilities';
import {UserProfile} from 'mattermost-redux/types/users';
import {TeamMembership, Team} from 'mattermost-redux/types/teams';

import {t} from 'utils/i18n';
import Constants from 'utils/constants';

import AdminPanel from 'components/widgets/admin_console/admin_panel';
import UserGrid from 'components/admin_console/user_grid/user_grid';
import {BaseMembership} from 'components/admin_console/user_grid/user_grid_role_dropdown';
import AddUsersToTeamModal from 'components/add_users_to_team_modal';
import ToggleModalButton from 'components/toggle_modal_button';

type Props = {
    teamId: string;
    team: Team;
    users: UserProfile[];
    usersToRemove: Dictionary<UserProfile>;
    usersToAdd: Dictionary<UserProfile>;
    teamMembers: Dictionary<TeamMembership>;

    totalCount: number;
    searchTerm: string;
    loading?: boolean;

    onAddCallback: (users: UserProfile[]) => void;
    onRemoveCallback: (user: UserProfile) => void;
    updateRole: (userId: string, schemeUser: boolean, schemeAdmin: boolean) => void;

    actions: {
        getTeamStats: (teamId: string) => Promise<{
            data: boolean;
        }>;
        loadProfilesAndReloadTeamMembers: (page: number, perPage: number, teamId?: string, options?: {}) => Promise<{
            data: boolean;
        }>;
        searchProfilesAndTeamMembers: (term: string, options?: {}) => Promise<{
            data: boolean;
        }>;
        setUserGridSearch: (term: string) => Promise<{
            data: boolean;
        }>;
        setUserGridFilters: (filters: FilterOptions) => Promise<{
            data: boolean;
        }>;
    };
}

type State = {
    loading: boolean;
}

const PROFILE_CHUNK_SIZE = 10;

export default class TeamMembers extends React.PureComponent<Props, State> {
    private searchTimeoutId: number;

    constructor(props: Props) {
        super(props);

        this.searchTimeoutId = 0;

        this.state = {
            loading: true,
        };
    }

    public componentDidMount() {
        const {teamId} = this.props;
        const {loadProfilesAndReloadTeamMembers, getTeamStats, setUserGridSearch, setUserGridFilters} = this.props.actions;
        Promise.all([
            setUserGridSearch(''),
            setUserGridFilters({}),
            getTeamStats(teamId),
            loadProfilesAndReloadTeamMembers(0, PROFILE_CHUNK_SIZE * 2, teamId),
        ]).then(() => this.setStateLoading(false));
    }

    public componentDidUpdate(prevProps: Props) {
        if (prevProps.searchTerm !== this.props.searchTerm) {
            this.setStateLoading(true);
            clearTimeout(this.searchTimeoutId);
            const searchTerm = this.props.searchTerm;

            if (searchTerm === '') {
                this.searchTimeoutId = 0;
                this.setStateLoading(false);
                return;
            }

            const searchTimeoutId = window.setTimeout(
                async () => {
                    await prevProps.actions.searchProfilesAndTeamMembers(searchTerm, {team_id: this.props.teamId, allow_inactive: false});

                    if (searchTimeoutId !== this.searchTimeoutId) {
                        return;
                    }
                    this.setStateLoading(false);
                },
                Constants.SEARCH_TIMEOUT_MILLISECONDS,
            );

            this.searchTimeoutId = searchTimeoutId;
        }
    }

    private setStateLoading = (loading: boolean) => {
        this.setState({loading});
    }

    private loadPage = async (page: number) => {
        const {loadProfilesAndReloadTeamMembers} = this.props.actions;
        const {teamId} = this.props;
        await loadProfilesAndReloadTeamMembers(page + 1, PROFILE_CHUNK_SIZE, teamId);
    }

    private removeUser = (user: UserProfile) => {
        this.props.onRemoveCallback(user);
    }

    private onAddCallback = (users: UserProfile[]) => {
        this.props.onAddCallback(users);
    }

    private search = async (term: string) => {
        this.props.actions.setUserGridSearch(term);
    }

    private onFilter = async (filterOptions: FilterOptions) => {
        const roles = filterOptions.role.values;
        const systemRoles = [];
        const teamRoles = [];
        if (roles.system_guest.value) {
            systemRoles.push('system_guest');
        }
        if (roles.system_user.value) {
            systemRoles.push('system_user');
        }
        if (roles.system_admin.value) {
            systemRoles.push('system_admin');
        }
        if (roles.team_admin.value) {
            teamRoles.push('team_admin');
        }

        if (systemRoles.length > 0 || teamRoles.length > 0) {
            this.props.actions.setUserGridFilters({ 'system_roles': systemRoles, 'team_roles': teamRoles });
        } else {
            this.props.actions.setUserGridFilters({})
        }

    }

    private updateMembership = (membership: BaseMembership) => {
        this.props.updateRole(membership.user_id, membership.scheme_user, membership.scheme_admin);
    }

    public render = () => {
        const {users, team, usersToAdd, usersToRemove, teamMembers, totalCount, searchTerm} = this.props;

        const filterOptions: FilterOptions = {
            'role': {
                name: 'Role',
                values: {
                    'system_guest': {
                        name: <FormattedMessage
                            id='admin.user_grid.filters.system_guest'
                            defaultMessage='Guest'
                        />,
                        value: false,
                    },
                    'system_user': {
                        name: <FormattedMessage
                            id='admin.user_grid.filters.system_member'
                            defaultMessage='Member'
                        />,
                        value: false,
                    },
                    'team_admin': {
                        name: <FormattedMessage
                            id='admin.user_grid.filters.team_admin'
                            defaultMessage='Team Admin'
                        />,
                        value: false,
                    },
                    'system_admin': {
                        name: <FormattedMessage
                            id='admin.user_grid.filters.system_admin'
                            defaultMessage='System Admin'
                        />,
                        value: false,
                    },
                },
                keys: ['system_guest', 'system_user', 'team_admin', 'system_admin'],
            },
        };
        const filterKeys = ['role'];
        const filterProps = {
            options: filterOptions,
            keys: filterKeys,
            onFilter: this.onFilter,
        }

        return (
            <AdminPanel
                id='teamMembers'
                titleId={t('admin.team_settings.team_detail.membersTitle')}
                titleDefault='Members'
                subtitleId={t('admin.team_settings.team_detail.membersDescription')}
                subtitleDefault='A list of users who are currently in the team right now'
                button={
                    <ToggleModalButton
                        id='addTeamMembers'
                        className='btn btn-primary'
                        dialogType={AddUsersToTeamModal}
                        dialogProps={{
                            team,
                            onAddCallback: this.onAddCallback,
                            skipCommit: true,
                            excludeUsers: usersToAdd,
                            includeUsers: usersToRemove,
                            filterExcludeGuests: true,
                        }}
                    >
                        <FormattedMessage
                            id='admin.team_settings.team_details.add_members'
                            defaultMessage='Add Members'
                        />
                    </ToggleModalButton>
                }
            >
                <UserGrid
                    loading={this.state.loading || Boolean(this.props.loading)}
                    users={users}
                    loadPage={this.loadPage}
                    removeUser={this.removeUser}
                    totalCount={totalCount}
                    memberships={teamMembers}
                    updateMembership={this.updateMembership}
                    search={this.search}
                    term={searchTerm}
                    includeUsers={usersToAdd}
                    excludeUsers={usersToRemove}
                    scope={'team'}
                    filterProps={filterProps}
                />
            </AdminPanel>
        );
    }
}
