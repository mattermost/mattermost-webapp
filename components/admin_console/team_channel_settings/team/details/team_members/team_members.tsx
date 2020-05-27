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
        setModalSearchTerm: (term: string) => Promise<{
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
        const {loadProfilesAndReloadTeamMembers, getTeamStats, setModalSearchTerm} = this.props.actions;
        Promise.all([
            setModalSearchTerm(''),
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
                    await prevProps.actions.searchProfilesAndTeamMembers(searchTerm, {team_id: this.props.teamId});

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
        this.props.actions.setModalSearchTerm(term);
    }

    private updateMembership = (membership: BaseMembership) => {
        this.props.updateRole(membership.user_id, membership.scheme_user, membership.scheme_admin);
    }

    public render = () => {
        const {users, team, usersToAdd, usersToRemove, teamMembers, totalCount, searchTerm} = this.props;
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
                />
            </AdminPanel>
        );
    }
}
