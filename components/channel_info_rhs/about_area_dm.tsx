// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import styled from 'styled-components';
import {useIntl} from 'react-intl';

import {Channel} from 'mattermost-redux/types/channels';
import Markdown from 'components/markdown';
import ProfilePicture from 'components/profile_picture';
import {Client4} from 'mattermost-redux/client';
import BotBadge from 'components/widgets/badges/bot_badge';
import GuestBadge from 'components/widgets/badges/guest_badge';

import {DMUser} from './channel_info_rhs';
import LineLimiter from './components/linelimiter';
import EditableArea from './components/editable_area';

const Username = styled.p`
    font-family: Metropolis, sans-serif;
    font-size: 18px;
    line-height: 24px;
    color: rgb(var(--center-channel-color-rgb));
    font-weight: 600;
    margin: 0;
`;

const ChannelHeader = styled.div`
    margin-bottom: 12px;
`;

const UserInfoContainer = styled.div`
    display: flex;
    align-items: center;
    margin-bottom: 12px;
`;

const UserAvatar = styled.div`
    .status {
        bottom: 0;
        right: 0;
        height: 18px;
        width: 18px;
        & svg {
            min-height: 14.4px;
        }
    }
`;

const UserInfo = styled.div`
    margin-left: 12px;
    display: flex;
    flex-direction: column;
`;

const UsernameContainer = styled.div`
    display: flex;
`;

const UserPosition = styled.div`
    line-height: 20px;
    p {
        margin-bottom: 0px;
    }
`;

interface Props {
    channel: Channel;
    dmUser: DMUser;
    actions: {
        editChannelHeader: () => void;
    };
}

const AboutAreaDM = ({channel, dmUser, actions}: Props) => {
    const {formatMessage} = useIntl();

    return (
        <>
            <UserInfoContainer>
                <UserAvatar>
                    <ProfilePicture
                        src={Client4.getProfilePictureUrl(dmUser.user.id, dmUser.user.last_picture_update)}
                        isBot={dmUser.user.is_bot}
                        status={dmUser.status ? dmUser.status : undefined}
                        isRHS={true}
                        username={dmUser.display_name}
                        userId={dmUser.user.id}
                        channelId={channel.id}
                        size='xl'
                        popoverPlacement='left'
                    />
                </UserAvatar>
                <UserInfo>
                    <UsernameContainer>
                        <Username>{dmUser.display_name}</Username>
                        {dmUser.user.is_bot && <BotBadge/>}
                        {dmUser.is_guest && <GuestBadge/>}
                    </UsernameContainer>
                    <UserPosition>
                        <Markdown message={dmUser.user.is_bot ? dmUser.user.bot_description : dmUser.user.position}/>
                    </UserPosition>
                </UserInfo>
            </UserInfoContainer>

            {!dmUser.user.is_bot && (
                <ChannelHeader>
                    <EditableArea
                        content={channel.header && (
                            <LineLimiter
                                maxLines={3}
                                lineHeight={20}
                                moreText={formatMessage({id: 'channel_info_rhs.about_area.channel_header.line_limiter.more', defaultMessage: '... more'})}
                                lessText={formatMessage({id: 'channel_info_rhs.about_area.channel_header.line_limiter.less', defaultMessage: 'less'})}
                            >
                                <Markdown message={channel.header}/>
                            </LineLimiter>
                        )}
                        editable={true}
                        onEdit={actions.editChannelHeader}
                        emptyLabel={formatMessage({id: 'channel_info_rhs.about_area.add_channel_header', defaultMessage: 'Add a channel header'})}
                    />
                </ChannelHeader>
            )}
        </>
    );
};

export default AboutAreaDM;
