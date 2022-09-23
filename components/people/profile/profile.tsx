// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {useSelector} from 'react-redux';
import {FormattedMessage} from 'react-intl';

import styled from 'styled-components';

import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';

import Badge from 'components/widgets/badges/badge';

import {GlobalState} from 'types/store';

import TimeZoneSelectMap from '../timezone_map/TimeZoneSelectMap';

import './profile.scss';

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
            box-shadow: 0 2px 3px rgba(0, 0, 0, 0.08);`;

const backToDirectory = () => {
    return true;
};

const Profile = () => {
    const user = useSelector((state: GlobalState) => getCurrentUser(state));

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
                <TimeZoneSelectMap timeZoneName={user.timezone?.automaticTimezone || undefined}/>
            </div>
            <div className='UserProfile__bottom-card'>
                <StyledCard
                    width={280}
                    height={308}
                    id={'user-picture-card'}
                >
                    <Badge
                        className='user-role'
                        show={true}
                    >
                        {user.roles}
                    </Badge>
                </StyledCard>
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
