// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import {Dictionary} from 'mattermost-redux/types/utilities';

import {UserProfile} from 'mattermost-redux/types/users';
import {Channel, ChannelMembership} from 'mattermost-redux/types/channels';

import {t} from 'utils/i18n';
import Constants from 'utils/constants';

import AdminPanel from 'components/widgets/admin_console/admin_panel';
import UserGrid from 'components/admin_console/user_grid/user_grid';
import {BaseMembership} from 'components/admin_console/user_grid/user_grid_role_dropdown';
import ChannelInviteModal from 'components/channel_invite_modal';
import ToggleModalButton from 'components/toggle_modal_button';

type Props = {
    channelId: string;
    channel: Channel;

    users: UserProfile[];
    usersToRemove: Dictionary<UserProfile>;
    usersToAdd: Dictionary<UserProfile>;
    channelMembers: Dictionary<ChannelMembership>;
    totalCount: number;

    loading?: boolean;

    onAddCallback: (users: UserProfile[]) => void;
    onRemoveCallback: (user: UserProfile) => void;
    updateRole: (userId: string, schemeUser: boolean, schemeAdmin: boolean) => void;

    searchTerm: string;

    actions: {
        getChannelStats: (channelId: string) => Promise<{
            data: boolean;
        }>;
        loadProfilesAndReloadChannelMembers: (page: number, perPage: number, channelId?: string, sort?: string, options?: {}) => Promise<{
            data: boolean;
        }>;
        searchProfilesAndChannelMembers: (term: string, options?: {}) => Promise<{
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

export default class ChannelMembers extends React.PureComponent<Props, State> {
    private searchTimeoutId: number;

    constructor(props: Props) {
        super(props);

        this.searchTimeoutId = 0;

        this.state = {
            loading: true,
        };
    }

    public componentDidMount() {
        const {channelId} = this.props;
        const {loadProfilesAndReloadChannelMembers, getChannelStats, setModalSearchTerm} = this.props.actions;
        Promise.all([
            setModalSearchTerm(''),
            getChannelStats(channelId),
            loadProfilesAndReloadChannelMembers(0, PROFILE_CHUNK_SIZE * 2, channelId),
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
                    await prevProps.actions.searchProfilesAndChannelMembers(searchTerm, {in_channel_id: this.props.channelId});

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
        const {loadProfilesAndReloadChannelMembers} = this.props.actions;
        const {channelId} = this.props;
        await loadProfilesAndReloadChannelMembers(page + 1, PROFILE_CHUNK_SIZE, channelId);
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

    render = () => {
        const {users, channel, channelId, usersToAdd, usersToRemove, channelMembers, totalCount, searchTerm} = this.props;
        return (
            <AdminPanel
                id='channelMembers'
                titleId={t('admin.channel_settings.channel_detail.membersTitle')}
                titleDefault='Members'
                subtitleId={t('admin.channel_settings.channel_detail.membersDescription')}
                subtitleDefault='A list of users who are currently in the channel right now'
                button={
                    <ToggleModalButton
                        id='addChannelMembers'
                        className='btn btn-primary'
                        dialogType={ChannelInviteModal}
                        dialogProps={{
                            channel,
                            channelId,
                            teamId: channel?.team_id, // eslint-disable-line camelcase, @typescript-eslint/camelcase
                            onAddCallback: this.onAddCallback,
                            skipCommit: true,
                            excludeUsers: usersToAdd,
                            includeUsers: usersToRemove,
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
                    memberships={channelMembers}
                    updateMembership={this.updateMembership}
                    search={this.search}
                    includeUsers={usersToAdd}
                    excludeUsers={usersToRemove}
                    term={searchTerm}
                    scope={'channel'}
                />
            </AdminPanel>
        );
    }
}
