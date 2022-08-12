// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {UserProfile} from '@mattermost/types/users';

import classNames from 'classnames';
import styled from 'styled-components';

import {displayUsername} from '../../utils/users';

interface Props {
    user?: UserProfile;
    teamnameNameDisplaySetting: string;
    profilePictureUri?: string;
    classNames?: Record<string, boolean>;
    className?: string;
    extra?: React.ReactNode;
    withoutProfilePic?: boolean;
    withoutName?: boolean;
    nameFormatter?: (preferredName: string, userName: string, firstName: string, lastName: string, nickName: string) => JSX.Element;
}

const ProfileTagContainer = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
`;

const ProfileImage = styled.img`
    margin: 0 8px 0 0;
    width: 32px;
    height: 32px;
    background-color: #bbb;
    border-radius: 50%;
    display: inline-block;

    .image-sm {
        width: 24px;
        height: 24px;
    }

    .Assigned-button & {
        margin: 0 4px 0 0;
        width: 20px;
        height: 20px;
    }
`;

const ProfileName = styled.div<{hasExtra: boolean}>`
    padding: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    min-height: 18px;
    display: flex;
    align-items: center;
    padding-right: ${({hasExtra}) => (hasExtra ? '4px' : '8px')};

    .description {
        color: rgba(var(--center-channel-color-rgb), 0.56);
        margin-left: 4px;
    }
`;

const ProfileTag = (props: Props) => {
    const {user, teamnameNameDisplaySetting, profilePictureUri} = props;

    let name = null;
    if (user) {
        const preferredName = displayUsername(user, teamnameNameDisplaySetting);
        name = preferredName;
        if (props.nameFormatter) {
            name = props.nameFormatter(preferredName, user.username, user.first_name, user.last_name, user.nickname);
        }
    }

    return (
        <ProfileTagContainer className={classNames('ProfileTagContainer', props.classNames, props.className)}>
            {
                !props.withoutProfilePic &&
                <ProfileImage
                    className='image'
                    src={profilePictureUri || ''}
                />
            }
            { !props.withoutName &&
                <ProfileName
                    hasExtra={Boolean(props.extra)}
                    className='name'
                >{name}</ProfileName>
            }
            {props.extra}
        </ProfileTagContainer>
    );
};

export default ProfileTag;
