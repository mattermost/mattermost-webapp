// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {FC, memo} from 'react';

import SimpleTooltip from 'components/simple_toopltip';

import Avatar from './avatar';
import ProfilePicture, {Props as ProfilePictureProps} from './profile_picture';

import './profile_pictures.scss';

type StylingKeys = 'size';

type Props = Pick<ProfilePictureProps, StylingKeys> & {
    users: Omit<ProfilePictureProps & {name: string}, StylingKeys>[];
    breakAt?: number;
}

const Avatars: FC<Props> = ({size, breakAt = 3, users}: Props) => {
    return (
        <div className={`ProfilePictures ProfilePictures-${size}`}>
            {users.slice(0, breakAt).map(({name, ...user}) => (
                <SimpleTooltip
                    key={user.userId}
                    id='groupNameTooltip'
                    content={name}
                >
                    <ProfilePicture
                        size={size}
                        {...user}
                    />
                </SimpleTooltip>
            ))}
            <SimpleTooltip
                id='groupNameTooltip'
                content={name}
            >
                <Avatar
                    size={size}
                >
                    {`+${users.length - breakAt}`}
                </Avatar>
            </SimpleTooltip>
        </div>
    );
};

export default memo(Avatars);
