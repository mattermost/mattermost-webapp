// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState} from 'react';
import {FormattedMessage} from 'react-intl';

import styled from 'styled-components';

import {UserProfile} from 'mattermost-redux/types/users';
import {Channel, ChannelMembership} from 'mattermost-redux/types/channels';
import Constants, {ModalIdentifiers} from 'utils/constants';
import MoreDirectChannels from 'components/more_direct_channels';
import ChannelInviteModal from 'components/channel_invite_modal';
import {ModalData} from 'types/actions';
import {browserHistory} from 'utils/browser_history';

import ActionBar from './action_bar';
import Header from './header';
import MemberList from './member_list';

export interface ChannelMember {
    user: UserProfile;
    membership: ChannelMembership;
    status: string;
    displayName: string;
}

const MembersContainer = styled.div`
    flex: 1;
`;

export interface Props {
    channel: Channel;
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
    };
}

export default function ChannelMembersRHS({channel, canGoBack, teamUrl, channelAdmins, channelMembers, canManageMembers, actions}: Props) {
    const [editing, setEditing] = useState(false);

    const membersCount = channelAdmins.length + channelMembers.length;

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
                membersCount={membersCount}
                canManageMembers={canManageMembers}
                editing={editing}
                actions={{
                    startEditing: () => setEditing(true),
                    stopEditing: () => setEditing(false),
                    inviteMembers,
                }}
            />

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
                        actions={{openDirectMessage}}
                    />
                )}

                {channelMembers.length > 0 && (
                    <MemberList
                        members={channelMembers}
                        title={
                            <FormattedMessage
                                id='channel_members_rhs.list.channel_members_title'
                                defaultMessage='MEMBERS'
                            />
                        }
                        editing={editing}
                        actions={{openDirectMessage}}
                    />
                )}
            </MembersContainer>
        </div>
    );
}
