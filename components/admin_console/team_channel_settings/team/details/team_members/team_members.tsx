// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import {ServerError} from 'mattermost-redux/types/errors';
import {UserProfile, UsersStats, GetFilteredUsersStatsOpts} from 'mattermost-redux/types/users';
import {TeamMembership, Team} from 'mattermost-redux/types/teams';
import {Dictionary} from 'mattermost-redux/types/utilities';
import GeneralConstants from 'mattermost-redux/constants/general';

import {t} from 'utils/i18n';
import Constants from 'utils/constants';
import {trackEvent} from 'actions/diagnostics_actions.jsx';

import AdminPanel from 'components/widgets/admin_console/admin_panel';
import UserGrid from 'components/admin_console/user_grid/user_grid';
import {BaseMembership} from 'components/admin_console/user_grid/user_grid_role_dropdown';
import AddUsersToTeamModal from 'components/add_users_to_team_modal';
import ToggleModalButton from 'components/toggle_modal_button';
import {FilterOptions} from 'components/admin_console/filter/filter';

type Props = {
    teamId: string;
    team: Team;
    filters: GetFilteredUsersStatsOpts;

    users: UserProfile[];
    usersToRemove: Dictionary<UserProfile>;
    usersToAdd: Dictionary<UserProfile>;
    teamMembers: Dictionary<TeamMembership>;

    totalCount: number;
    searchTerm: string;
    loading?: boolean;
    isDisabled?: boolean;
    enableGuestAccounts: boolean;

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
        getFilteredUsersStats: (filters: GetFilteredUsersStatsOpts) => Promise<{
            data?: UsersStats;
            error?: ServerError;
        }>;
        setUserGridSearch: (term: string) => Promise<{
            data: boolean;
        }>;
        setUserGridFilters: (filters: GetFilteredUsersStatsOpts) => Promise<{
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
            loadProfilesAndReloadTeamMembers(0, PROFILE_CHUNK_SIZE * 2, teamId, {active: true}),
        ]).then(() => this.setStateLoading(false));
    }

    public async componentDidUpdate(prevProps: Props) {
        const filtersModified = JSON.stringify(prevProps.filters) !== JSON.stringify(this.props.filters);
        const searchTermModified = prevProps.searchTerm !== this.props.searchTerm;
        if (filtersModified || searchTermModified) {
            this.setStateLoading(true);
            clearTimeout(this.searchTimeoutId);
            const searchTerm = this.props.searchTerm;
            const filters = this.props.filters;

            if (searchTerm === '') {
                this.searchTimeoutId = 0;
                if (filtersModified) {
                    await prevProps.actions.loadProfilesAndReloadTeamMembers(0, PROFILE_CHUNK_SIZE * 2, prevProps.teamId, {active: true, ...filters});
                }
                this.setStateLoading(false);
                return;
            }

            const searchTimeoutId = window.setTimeout(
                async () => {
                    await prevProps.actions.searchProfilesAndTeamMembers(searchTerm, {...filters, team_id: this.props.teamId, allow_inactive: false});

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
        const {teamId, filters} = this.props;
        await loadProfilesAndReloadTeamMembers(page + 1, PROFILE_CHUNK_SIZE, teamId, {active: true, ...filters});
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
        const systemRoles: string[] = [];
        const teamRoles: string[] = [];
        let filters = {};
        Object.keys(roles).forEach((filterKey: string) => {
            if (roles[filterKey].value) {
                if (filterKey.includes('team')) {
                    teamRoles.push(filterKey);
                } else {
                    systemRoles.push(filterKey);
                }
            }
        });

        if (systemRoles.length > 0 || teamRoles.length > 0) {
            if (systemRoles.length > 0) {
                filters = {roles: systemRoles};
            }
            if (teamRoles.length > 0) {
                filters = {...filters, team_roles: teamRoles};
            }
            [...systemRoles, ...teamRoles].forEach((role) => {
                trackEvent('admin_team_config_page', `${role}_filter_applied_to_members_block`, {team_id: this.props.teamId});
            });
            this.props.actions.setUserGridFilters({roles: systemRoles, team_roles: teamRoles});
            this.props.actions.getFilteredUsersStats({in_team: this.props.teamId, include_bots: true, ...filters});
        } else {
            this.props.actions.setUserGridFilters(filters);
        }
    }

    private updateMembership = (membership: BaseMembership) => {
        this.props.updateRole(membership.user_id, membership.scheme_user, membership.scheme_admin);
    }

    public render = () => {
        const {users, team, usersToAdd, usersToRemove, teamMembers, totalCount, searchTerm, isDisabled} = this.props;

        const filterOptions: FilterOptions = {
            role: {
                name: (
                    <FormattedMessage
                        id='admin.user_grid.role'
                        defaultMessage='Role'
                    />
                ),
                values: {
                    [GeneralConstants.SYSTEM_GUEST_ROLE]: {
                        name: (
                            <FormattedMessage
                                id='admin.user_grid.guest'
                                defaultMessage='Guest'
                            />
                        ),
                        value: false,
                    },
                    [GeneralConstants.TEAM_USER_ROLE]: {
                        name: (
                            <FormattedMessage
                                id='admin.user_item.member'
                                defaultMessage='Member'
                            />
                        ),
                        value: false,
                    },
                    [GeneralConstants.TEAM_ADMIN_ROLE]: {
                        name: (
                            <FormattedMessage
                                id='admin.user_grid.team_admin'
                                defaultMessage='Team Admin'
                            />
                        ),
                        value: false,
                    },
                    [GeneralConstants.SYSTEM_ADMIN_ROLE]: {
                        name: (
                            <FormattedMessage
                                id='admin.user_grid.system_admin'
                                defaultMessage='System Admin'
                            />
                        ),
                        value: false,
                    },
                },
                keys: [GeneralConstants.SYSTEM_GUEST_ROLE, GeneralConstants.TEAM_USER_ROLE, GeneralConstants.TEAM_ADMIN_ROLE, GeneralConstants.SYSTEM_ADMIN_ROLE],
            },
        };
        if (!this.props.enableGuestAccounts) {
            delete filterOptions.role.values[GeneralConstants.SYSTEM_GUEST_ROLE];
            filterOptions.role.keys = [GeneralConstants.TEAM_USER_ROLE, GeneralConstants.TEAM_ADMIN_ROLE, GeneralConstants.SYSTEM_ADMIN_ROLE];
        }
        const filterKeys = ['role'];
        const filterProps = {
            options: filterOptions,
            keys: filterKeys,
            onFilter: this.onFilter,
        };

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
                        isDisabled={isDisabled}
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
                    readOnly={isDisabled}
                    filterProps={filterProps}
                />
            </AdminPanel>
        );
    }
}
