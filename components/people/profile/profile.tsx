// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {useSelector} from 'react-redux';
import {FormattedMessage, useIntl} from 'react-intl';

import styled from 'styled-components';

import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';
import {Client4} from 'mattermost-redux/client';

import {GlobalState} from 'types/store';

import CallButton from 'plugins/call_button';

import {UserProfile} from '@mattermost/types/users';

import TimeZoneSelectMap from '../timezone_map/TimeZoneSelectMap';

import ProfileCard from '../profile_card/profile_card';

import './profile.scss';

import SendMessageButton from './send_message_button';

type StyledCardProps = {
    width?: number;
    height?: number;
}

const StyledCard = styled.div<StyledCardProps>`
    padding: 28px 32px;
    border: 1px solid rgba(var(--sys-center-channel-color-rgb), 0.08);
    background: var(--sys-center-channel-bg);
    border-radius: 4px;
    width: ${(props) => `${props.width}px`};
    height: ${(props) => `${props.height}px`};
    box-shadow: 0 2px 3px rgba(0, 0, 0, 0.08);
`;

const backToDirectory = () => {
    return true;
};

type ProfileProps = {
    user?: UserProfile;
}

const Profile = ({user}: ProfileProps) => {
    const {formatMessage} = useIntl();
    const userMe = useSelector((state: GlobalState) => getCurrentUser(state));

    const userProfile = user || userMe;

    const imgUrl = Client4.getProfilePictureUrl(userProfile.id, userProfile.last_picture_update);

    return (
        <div className='UserProfile'>
            <div className='UserProfile__header-card'>
                <div className='UserProfile__header-card__top-section'>
                    <a
                        className='UserProfile__header-card__top-section__back'
                        onClick={backToDirectory}
                    >
                        <i className='icon-arrow-left'/>
                        <FormattedMessage
                            id={'user-profile.header.back-text'}
                            defaultMessage={'Back to directory'}
                        />
                    </a>
                </div>
                <TimeZoneSelectMap
                    timeZoneName={userProfile.timezone?.automaticTimezone || undefined}
                />
            </div>
            <div className='UserProfile__bottom-card'>
                <ProfileCard
                    user={userProfile}
                    avatarSrc={imgUrl}
                    role={'system_admin'}
                    footer={user && user !== userMe && (
                        <>
                            <div className='profile-card__action-buttons'>
                                <SendMessageButton
                                    user={user}
                                    buttonText={formatMessage({id: 'people.teams.message', defaultMessage: 'Message'})}
                                />
                                <CallButton/>
                            </div>
                        </>
                    )}
                />
                <StyledCard
                    width={591}
                    height={325}
                    id={'user-profile-details-card'}
                >
                    <p>{'details'}</p>
                </StyledCard>
            </div>
        </div>
    );
};

export default Profile;
