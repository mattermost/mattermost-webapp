// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect, useState} from 'react';
import {FormattedMessage} from 'react-intl';
import styled from 'styled-components';

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

export interface ChannelMember {
    user: UserProfile;
    membership: ChannelMembership;
    status: string;
    displayName: string;
}

const MembersContainer = styled.div`
    flex: 1;
    padding: 0 4px 16px;
    overflow-y: auto;
`;

export interface Props {
    channel: Channel;
    membersCount: number;
    searchTerms: string;
    canGoBack: boolean;
    teamUrl: string;
    channelMembers: ChannelMember[];
    channelAdmins: ChannelMember[];
    canManageMembers: boolean;

    actions: {
        openModal: <P>(modalData: ModalData<P>) => void;
        openDirectChannelToUserId: (userId: string) => Promise<{ data: Channel }>;
        closeRightHandSide: () => void;
        goBack: () => void;
        setChannelMembersRhsSearchTerm: (terms: string) => void;
        loadProfilesAndReloadChannelMembers: (channelId: string) => void;
        loadMyChannelMemberAndRole: (channelId: string) => void;
    };
}

export default function ChannelMembersRHS({channel, searchTerms, membersCount, canGoBack, teamUrl, channelAdmins, channelMembers, canManageMembers, actions}: Props) {
    const [editing, setEditing] = useState(false);

    const searching = searchTerms !== '';

    // show search if there's more than 20 or if the user have an active search.
    const showSearch = searching || membersCount >= 20;

    let normalMemberTitle;
    if (channelMembers.length > 0 && !searching) {
        normalMemberTitle = (
            <FormattedMessage
                id='channel_members_rhs.list.channel_members_title'
                defaultMessage='MEMBERS'
            />
        );
    }

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

        actions.setChannelMembersRhsSearchTerm('');
        setEditing(false);
        actions.loadProfilesAndReloadChannelMembers(channel.id);
        actions.loadMyChannelMemberAndRole(channel.id);
    }, [channel.id, channel.type]);

    const doSearch = async (terms: string) => {
        actions.setChannelMembersRhsSearchTerm(terms);
    };

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
                    startEditing: () => setEditing(true),
                    stopEditing: () => setEditing(false),
                    inviteMembers,
                }}
            />

            {showSearch && (
                <SearchBar
                    terms={searchTerms}
                    onInput={doSearch}
                />
            )}

            <MembersContainer>
                {channelAdmins.length > 0 && (
                    <MemberList
                        members={channelAdmins}
                        title={
                            <FormattedMessage
                                id='channel_members_rhs.list.channel_admin_title'
                                defaultMessage='CHANNEL ADMINS'
                            />
                        }
                        editing={editing}
                        channel={channel}
                        actions={{openDirectMessage}}
                    />
                )}

                {channelMembers.length > 0 && (
                    <MemberList
                        members={channelMembers}
                        title={normalMemberTitle}
                        editing={editing}
                        channel={channel}
                        actions={{openDirectMessage}}
                    />
                )}
            </MembersContainer>
        </div>
    );
}
