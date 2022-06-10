// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback, useEffect, useState} from 'react';
import styled from 'styled-components';
import {debounce} from 'lodash';

import {UserProfile} from '@mattermost/types/users';
import {Channel, ChannelMembership} from '@mattermost/types/channels';
import Constants, {ModalIdentifiers} from 'utils/constants';
import MoreDirectChannels from 'components/more_direct_channels';
import ChannelInviteModal from 'components/channel_invite_modal';
import {ModalData} from 'types/actions';
import {browserHistory} from 'utils/browser_history';

import ActionBar from './action_bar';
import Header from './header';
import MemberList from './member_list';
import SearchBar from './search';

const USERS_PER_PAGE = 100;
export interface ChannelMember {
    user: UserProfile;
    membership?: ChannelMembership;
    status?: string;
    displayName: string;
}

const MembersContainer = styled.div`
    flex: 1 1 auto;
    padding: 0 4px 16px;
`;

export interface Props {
    channel: Channel;
    membersCount: number;
    searchTerms: string;
    canGoBack: boolean;
    teamUrl: string;
    channelMembers: ChannelMember[];
    canManageMembers: boolean;
    editing: boolean;

    actions: {
        openModal: <P>(modalData: ModalData<P>) => void;
        openDirectChannelToUserId: (userId: string) => Promise<{ data: Channel }>;
        closeRightHandSide: () => void;
        goBack: () => void;
        setChannelMembersRhsSearchTerm: (terms: string) => void;
        loadProfilesAndReloadChannelMembers: (page: number, perParge: number, channelId: string) => void;
        loadMyChannelMemberAndRole: (channelId: string) => void;
        setEditChannelMembers: (active: boolean) => void;
        searchProfilesAndChannelMembers: (term: string, options: any) => Promise<{data: UserProfile[]}>;
    };
}

export default function ChannelMembersRHS({
    channel,
    searchTerms,
    membersCount,
    canGoBack,
    teamUrl,
    channelMembers,
    canManageMembers,
    editing = false,
    actions,
}: Props) {
    const [page, setPage] = useState(0);
    const [isNextPageLoading, setIsNextPageLoading] = useState(false);

    const searching = searchTerms !== '';

    // show search if there's more than 20 or if the user have an active search.
    const showSearch = searching || membersCount >= 20;

    useEffect(() => {
        return () => {
            actions.setChannelMembersRhsSearchTerm('');
        };
    }, []);

    useEffect(() => {
        if (channel.type === Constants.DM_CHANNEL) {
            let rhsAction = actions.closeRightHandSide;
            if (canGoBack) {
                rhsAction = actions.goBack;
            }
            rhsAction();
            return;
        }

        setPage(0);
        setIsNextPageLoading(false);
        actions.setChannelMembersRhsSearchTerm('');
        actions.loadProfilesAndReloadChannelMembers(0, USERS_PER_PAGE, channel.id);
        actions.loadMyChannelMemberAndRole(channel.id);
    }, [channel.id, channel.type]);

    const setSearchTerms = async (terms: string) => {
        actions.setChannelMembersRhsSearchTerm(terms);
    };

    const doSearch = useCallback(debounce(async (terms: string) => {
        await actions.searchProfilesAndChannelMembers(terms, {in_team_id: channel.team_id, in_channel_id: channel.id});
    }, Constants.SEARCH_TIMEOUT_MILLISECONDS), [actions.searchProfilesAndChannelMembers]);

    useEffect(() => {
        if (searchTerms) {
            doSearch(searchTerms);
        }
    }, [searchTerms]);

    const inviteMembers = () => {
        if (channel.type === Constants.GM_CHANNEL) {
            return actions.openModal({
                modalId: ModalIdentifiers.CREATE_DM_CHANNEL,
                dialogType: MoreDirectChannels,
                dialogProps: {isExistingChannel: true},
            });
        }

        return actions.openModal({
            modalId: ModalIdentifiers.CHANNEL_INVITE,
            dialogType: ChannelInviteModal,
            dialogProps: {channel},
        });
    };

    const openDirectMessage = async (user: UserProfile) => {
        // we first prepare the DM channel...
        await actions.openDirectChannelToUserId(user.id);

        // ... qnd then redirect to it
        browserHistory.push(teamUrl + '/messages/@' + user.username);

        await actions.closeRightHandSide();
    };

    const loadMore = async () => {
        setIsNextPageLoading(true);

        await actions.loadProfilesAndReloadChannelMembers(page + 1, USERS_PER_PAGE, channel.id);
        setPage(page + 1);

        setIsNextPageLoading(false);
    };

    return (
        <div
            id='rhsContainer'
            className='sidebar-right__body'
        >

            <Header
                channel={channel}
                canGoBack={canGoBack}
                onClose={actions.closeRightHandSide}
                goBack={actions.goBack}
            />

            <ActionBar
                channelType={channel.type}
                membersCount={membersCount}
                canManageMembers={canManageMembers}
                editing={editing}
                actions={{
                    startEditing: () => actions.setEditChannelMembers(true),
                    stopEditing: () => actions.setEditChannelMembers(false),
                    inviteMembers,
                }}
            />

            {showSearch && (
                <SearchBar
                    terms={searchTerms}
                    onInput={setSearchTerms}
                />
            )}

            <MembersContainer>
                {channelMembers.length > 0 && (
                    <MemberList
                        members={channelMembers}
                        editing={editing}
                        channel={channel}
                        actions={{openDirectMessage, loadMore}}
                        hasNextPage={channelMembers.length < membersCount}
                        isNextPageLoading={isNextPageLoading}
                    />
                )}
            </MembersContainer>
        </div>
    );
}
