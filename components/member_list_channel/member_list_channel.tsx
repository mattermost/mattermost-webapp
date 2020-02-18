// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {UserProfile} from 'mattermost-redux/types/users';
import {Channel, ChannelMembership} from 'mattermost-redux/types/channels';

import Constants from 'utils/constants';
import * as UserAgent from 'utils/user_agent';

import ChannelMembersDropdown from 'components/channel_members_dropdown';
import SearchableUserList from 'components/searchable_user_list/searchable_user_list_container.jsx';
import LoadingScreen from 'components/loading_screen';

const USERS_PER_PAGE = 50;

type Props = {
    currentTeamId: string;
    currentChannelId: string;
    searchTerm: string;
    usersToDisplay: Array<UserProfile>;
    actionUserProps: {
        [userId: string]: {
            channel: Channel;
            teamMember: any;
            channelMember: ChannelMembership;
        };
    };
    totalChannelMembers: number;
    channel: Channel;
    actions: {
        searchProfiles: (term: string, options?: {}) => Promise<{data: UserProfile[]}>;
        getChannelStats: (channelId: string) => Promise<{data: {}}>;
        setModalSearchTerm: (term: string) => Promise<{
            data: boolean;
        }>;
        loadProfilesAndTeamMembersAndChannelMembers: (page: number, perPage: number, teamId?: string, channelId?: string) => Promise<{
            data: boolean;
        }>;
        loadStatusesForProfilesList: (users: Array<UserProfile>) => Promise<{
            data: boolean;
        }>;
        loadTeamMembersAndChannelMembersForProfilesList: (profiles: any, teamId: string, channelId: string) => Promise<{
            data: boolean;
        }>;
    };
}

type State = {
    loading: boolean;
}

export default class MemberListChannel extends React.PureComponent<Props, State> {
    private searchTimeoutId: number;

    constructor(props: Props) {
        super(props);

        this.searchTimeoutId = 0;

        this.state = {
            loading: true,
        };
    }

    componentDidMount() {
        const {
            actions,
            currentChannelId,
            currentTeamId,
        } = this.props;

        actions.loadProfilesAndTeamMembersAndChannelMembers(0, Constants.PROFILE_CHUNK_SIZE, currentTeamId, currentChannelId).then(({data}) => {
            if (data) {
                this.loadComplete();
            }
        });

        actions.getChannelStats(currentChannelId);
    }

    componentWillUnmount() {
        this.props.actions.setModalSearchTerm('');
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
                    const {data} = await prevProps.actions.searchProfiles(searchTerm, {team_id: this.props.currentTeamId, in_channel_id: this.props.currentChannelId});

                    if (searchTimeoutId !== this.searchTimeoutId) {
                        return;
                    }

                    this.props.actions.loadStatusesForProfilesList(data);
                    this.props.actions.loadTeamMembersAndChannelMembersForProfilesList(data, this.props.currentTeamId, this.props.currentChannelId).then(({data: membersLoaded}) => {
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

    nextPage = (page: number) => {
        this.props.actions.loadProfilesAndTeamMembersAndChannelMembers(page + 1, USERS_PER_PAGE);
    }

    handleSearch = (term: string) => {
        this.props.actions.setModalSearchTerm(term);
    }

    render() {
        if (this.state.loading) {
            return (<LoadingScreen/>);
        }
        const channelIsArchived = this.props.channel.delete_at !== 0;
        return (
            <SearchableUserList
                users={this.props.usersToDisplay}
                usersPerPage={USERS_PER_PAGE}
                total={this.props.totalChannelMembers}
                nextPage={this.nextPage}
                search={this.handleSearch}
                actions={channelIsArchived ? [] : [ChannelMembersDropdown]}
                actionUserProps={this.props.actionUserProps}
                focusOnMount={!UserAgent.isMobile()}
            />
        );
    }
}
