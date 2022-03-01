// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import styled from 'styled-components';
import {FormattedMessage} from 'react-intl';

import Constants from 'utils/constants';
import {Channel} from 'mattermost-redux/types/channels';
import Markdown from 'components/markdown';
import {UserProfile} from 'mattermost-redux/types/users';
import ProfilePicture from 'components/profile_picture';
import {Client4} from 'mattermost-redux/client';
import BotBadge from 'components/widgets/badges/bot_badge';
import GuestBadge from 'components/widgets/badges/guest_badge';

import {DMUser} from './rhs';

const Container = styled.div`
    padding: 24px;
    padding-bottom: 12px;

    font-size: 14px;
    line-height: 20px;

    & .status-wrapper {
        height: 50px;
    }
`;

const Usernames = styled.p`
    font-family: Metropolis, sans-serif;
    font-size: 18px;
    line-height: 24px;
    color: #3F4350;
    font-weight: 600;
    margin: 0;
`;

const ChannelLink = styled.p`
    margin-bottom: 12px;
    font-size: 11px;
    line-height: 16px;
    letter-spacing: 0.02em;
`;

const GmProfilePictures = styled.div`
    margin-bottom: 10px;
`;

interface GmProfilePictureprops {
    position: number;
}

const GmProfilePicture = styled.div<GmProfilePictureprops>`
    display: inline-block;
    position: relative;
    left: ${(props) => props.position * -15}px;

    & img {
        border: 2px solid white;
    }
`;

const ChannelPurpose = styled.div`
    margin-bottom: 12px;
    &.ChannelPurpose__is-dm {
        margin-bottom: 16px;
    }
`;

const ChannelDescription = styled.div`
    margin-bottom: 12px;
`;

const DmPurpose = styled.div`
    display: flex;
    align-items: center;
`;

const DmUserInfo = styled.div`
    margin-left: 12px;
    display: flex;
    flex-direction: column;
`;

const DmUserName = styled.div`
    display: flex;
`;

const DmUserPosition = styled.div`
    line-height: 20px;
`;

const EmptyPlace = styled.div`
    padding: 0px;
    background: transparent;
    border: 0px;
    color: rgba(63, 67, 80, 0.64);
`;

const EditButton = styled.button`
    border: 0;
    padding: 4px;
    margin: 0px;
    border-radius: 4px;
    background: rgba(63, 67, 80, 0.04);
    color: rgba(63, 67, 80, 0.56);
    &:hover {
        background: rgba(63, 67, 80, 0.08);
        color: rgba(63, 67, 80, 0.72);
    }
`;

interface EditableAreaProps {
    editable: boolean;
    content: JSX.Element;
    onEdit: () => void;
    className?: string;
}

const editableArea = ({editable, content, onEdit, className}: EditableAreaProps) => {
    return (
        <div className={className}>
            <div className='EditableArea__content'>{content}</div>
            <div className='EditableArea__edit'>
                {editable ? (<EditButton onClick={onEdit}><i className='icon icon-pencil-outline'/></EditButton>) : ''}
            </div>
        </div>
    );
};

const EditableArea = styled(editableArea)`
    display: flex;
    &>div.EditableArea__content {
        flex: 1;
    }
    &:hover {
        &>div.EditableArea__edit {
            visibility: visible;
        }
    }

    &>div.EditableArea__edit {
        visibility: hidden;
        width: 24px;
    }
`;

interface Props {
    channel: Channel;
    channelURL: string;
    dmUser?: DMUser;
    gmUsers?: UserProfile[];
    canEditChannelProperties: boolean;
    actions: {
        editChannelPurpose: () => void;
        editChannelDescription: () => void;
    };
}

const AboutArea = ({channel, channelURL, dmUser, gmUsers, canEditChannelProperties, actions}: Props) => {
    let isOpenOrPrivateChannel = false;
    let isDirectChannel = false;

    let channelPurpose: JSX.Element | null = null;
    let channelPurposeClass = '';

    const editChannelPurpose = () => actions.editChannelPurpose();
    const editChannelDescription = () => actions.editChannelDescription();

    let canEditDescription = true;

    switch (channel.type) {
    case Constants.OPEN_CHANNEL:
    case Constants.PRIVATE_CHANNEL:
        canEditDescription = canEditChannelProperties;
        isOpenOrPrivateChannel = true;
        channelPurposeClass = 'editable';
        channelPurpose = (
            <EditableArea
                editable={canEditChannelProperties}
                content={channel.purpose ? (
                    <Markdown message={channel.purpose}/>
                ) : (
                    <EmptyPlace>
                        {canEditChannelProperties ? (
                            <FormattedMessage
                                id='channel_info_rhs.about_area.add_channel_purpose'
                                defaultMessage='Add a channel purpose'
                            />
                        ) : (
                            <FormattedMessage
                                id='channel_info_rhs.about_area.no_channel_purpose'
                                defaultMessage='No channel purpose'
                            />

                        )}
                    </EmptyPlace>
                )}
                onEdit={editChannelPurpose}
            />
        );
        break;
    case Constants.GM_CHANNEL:
        channelPurpose = (
            <>
                <GmProfilePictures>
                    {gmUsers!.map((user, idx) => (
                        <GmProfilePicture
                            key={`GMProfilePicture-${idx}`}
                            position={idx}
                        >
                            <ProfilePicture
                                src={Client4.getProfilePictureUrl(user.id, user.last_picture_update)}
                                size='xl'
                            />
                        </GmProfilePicture>
                    ))}
                </GmProfilePictures>
                <Usernames>{channel.display_name}</Usernames>
            </>
        );
        break;
    case Constants.DM_CHANNEL:
        isDirectChannel = true;
        channelPurposeClass = 'is-dm';
        if (dmUser) {
            channelPurpose = (
                <DmPurpose>
                    <div>
                        <ProfilePicture
                            src={Client4.getProfilePictureUrl(dmUser.user.id, dmUser.user.last_picture_update)}
                            status={(!dmUser.user.is_bot && Boolean(dmUser.status)) ? dmUser.status : undefined}
                            size='xl'
                        />
                    </div>
                    <DmUserInfo>
                        <DmUserName>
                            <Usernames>{dmUser.user.username}</Usernames>
                            {dmUser.user.is_bot && <BotBadge/>}
                            {dmUser.is_guest && <GuestBadge/>}
                        </DmUserName>
                        <DmUserPosition>
                            <Markdown message={dmUser.user.is_bot ? dmUser.user.bot_description : dmUser?.user.position}/>
                        </DmUserPosition>
                    </DmUserInfo>
                </DmPurpose>
            );
        }
        break;
    }

    const noDescription = isDirectChannel && dmUser?.user.is_bot;

    return (
        <Container>

            {channelPurpose && (
                <ChannelPurpose className={channelPurposeClass ? `ChannelPurpose__${channelPurposeClass}` : ''}>
                    {channelPurpose}
                </ChannelPurpose>
            )}

            {!noDescription && (
                <ChannelDescription>
                    <EditableArea
                        content={channel.header ? (
                            <Markdown message={channel.header}/>
                        ) : (
                            <EmptyPlace>
                                {canEditDescription ? (
                                    <FormattedMessage
                                        id='channel_info_rhs.about_area.add_channel_description'
                                        defaultMessage='Add a channel description'
                                    />
                                ) : (
                                    <FormattedMessage
                                        id='channel_info_rhs.about_area.no_channel_description'
                                        defaultMessage='No channel description'
                                    />

                                )}
                            </EmptyPlace>
                        )}
                        editable={canEditDescription}
                        onEdit={editChannelDescription}
                    />
                </ChannelDescription>
            )}

            {isOpenOrPrivateChannel && (
                <ChannelLink>{channelURL}</ChannelLink>
            )}

        </Container>
    );
};

export default AboutArea;
