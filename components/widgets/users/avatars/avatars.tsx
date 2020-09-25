// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {FC, memo, ComponentProps} from 'react';

import SimpleTooltip from 'components/simple_tooltip';

import Avatar from 'components/widgets/users/avatar';

import './avatars.scss';

type StylingKeys = 'size';

type UserProps = ComponentProps<typeof Avatar> & {name: string};

export type Props = Pick<UserProps, StylingKeys> & {
    users: Omit<UserProps, StylingKeys>[];
    breakAt?: number;
}

const Avatars: FC<Props> = ({
    size,
    users,
    breakAt = users?.length > 4 ? 3 : 4,
}: Props) => {
    const displayUsers = users.slice(0, breakAt);
    const others = users.slice(breakAt);

    return (
        <div className={`Avatars Avatars___${size}`}>
            {displayUsers.map(({name, ...user}) => (
                <SimpleTooltip
                    key={user.url}
                    id={'nameTooltip'}
                    content={name}
                >
                    <div>
                        <Avatar
                            size={size}
                            {...user}
                        />
                    </div>
                </SimpleTooltip>
            ))}
            {Boolean(others.length) && (
                <SimpleTooltip
                    id='nameTooltip'
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
