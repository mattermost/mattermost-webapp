// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {FC, memo} from 'react';

import SimpleTooltip from 'components/simple_tooltip';

import Avatar from './avatar';
import ProfilePicture, {Props as ProfilePictureProps} from './profile_picture';

import './profile_pictures.scss';

type StylingKeys = 'size';

type Props = Pick<ProfilePictureProps, StylingKeys> & {
    users: Omit<ProfilePictureProps & {name: string}, StylingKeys>[];
    breakAt?: number;
}

const Avatars: FC<Props> = ({size, breakAt = 3, users}: Props) => {
    const displayUsers = users.slice(0, breakAt);
    const others = users.slice(breakAt);

    return (
        <div className={`ProfilePictures ProfilePictures-${size}`}>
            {displayUsers.map(({name, ...user}) => (
                <SimpleTooltip
                    key={user.userId}
                    id={'groupNameTooltip'}
                    content={name}
                >
                    <div>
                        <ProfilePicture
                            size={size}
                            {...user}
                        />
                    </div>
                </SimpleTooltip>
            ))}
            {others.length && (
                <SimpleTooltip
                    id='groupNameTooltip'
                    content={others.map((user) => user.name).join(', ')}
                >
                    <div>
                        <Avatar
                            size={size}
                        >
                            {`+${others.length}`}
                        </Avatar>
                    </div>
                </SimpleTooltip>
            )}

        </div>
    );
};

export default memo(Avatars);
