// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo} from 'react';

import styled from 'styled-components';

import {UserProfile} from 'mattermost-redux/types/users';
import {Channel} from 'mattermost-redux/types/channels';

import {getSiteURL} from 'utils/url';
import ChannelInviteModal from 'components/channel_invite_modal';
import {Team} from 'mattermost-redux/types/teams';
import {ModalData} from 'types/actions';
import {ModalIdentifiers} from 'utils/constants';

import EditChannelPurposeModal from 'components/edit_channel_purpose_modal';

import EditChannelHeaderModal from 'components/edit_channel_header_modal';

import Menu from './menu';
import AboutArea from './about_area';
import TopButtons from './top_buttons';
import Header from './header';

const Divider = styled.div`
    width: 88%;
    border: 1px solid rgba(61, 60, 64, 0.08);
    margin: 0 auto;
`;

export interface DMUser {
    user: UserProfile;
    is_guest: boolean;
    status: string;
}

export interface ChannelInfoRhsProps {
    channel: Channel;
    currentUserId: string;
    currentTeam: Team;

    isFavorite: boolean;
    isMuted: boolean;
    isInvitingPeople: boolean;

    dmUser?: DMUser;
    gmUsers?: UserProfile[];

    actions: {
        closeRightHandSide: () => void;
        unfavoriteChannel: (channelId: string) => void;
        favoriteChannel: (channelId: string) => void;
        unmuteChannel: (userId: string, channelId: string) => void;
        muteChannel: (userId: string, channelId: string) => void;
        openModal: <P>(modalData: ModalData<P>) => void;
    };
}

const ChannelInfoRhs = ({channel, isFavorite, isMuted, isInvitingPeople, currentTeam, currentUserId, dmUser, gmUsers, actions}: ChannelInfoRhsProps) => {
    const channelURL = getSiteURL() + '/' + currentTeam.name + '/channels/' + channel.name;

    const closeRhs = () => actions.closeRightHandSide();

    const toggleFavorite = () => {
        if (isFavorite) {
            actions.unfavoriteChannel(channel.id);
            return;
        }
        actions.favoriteChannel(channel.id);
    };

    const toggleMute = () => {
        if (isMuted) {
            actions.unmuteChannel(currentUserId, channel.id);
            return;
        }
        actions.muteChannel(currentUserId, channel.id);
    };

    const addPeople = () => actions.openModal({
        modalId: ModalIdentifiers.CHANNEL_INVITE,
        dialogType: ChannelInviteModal,
        dialogProps: {channel},
    });

    const editChannelPurpose = () => actions.openModal({
        modalId: ModalIdentifiers.EDIT_CHANNEL_PURPOSE,
        dialogType: EditChannelPurposeModal,
        dialogProps: {channel},
    });

    const editChannelDescription = () => actions.openModal({
        modalId: ModalIdentifiers.EDIT_CHANNEL_HEADER,
        dialogType: EditChannelHeaderModal,
        dialogProps: {channel},
    });

    return (
        <div
            id='rhsContainer'
            className='sidebar-right__body'
        >
            <Header
                channel={channel}
                onClose={closeRhs}
            />

            <TopButtons
                channelType={channel.type}
                channelURL={channelURL}

                isFavorite={isFavorite}
                isMuted={isMuted}
                isInvitingPeople={isInvitingPeople}

                toggleFavorite={toggleFavorite}
                toggleMute={toggleMute}
                addPeople={addPeople}
            />

            <AboutArea
                channel={channel}
                channelURL={channelURL}

                dmUser={dmUser}
                gmUsers={gmUsers}

                actions={{
                    editChannelDescription,
                    editChannelPurpose,
                }}
            />

            <Divider/>

            <Menu
                channel={channel}
            />
        </div>
    );
};

export default memo(ChannelInfoRhs);
