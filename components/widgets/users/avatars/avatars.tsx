// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo, ComponentProps} from 'react';
import {useIntl} from 'react-intl';

import SimpleTooltip, {useSynchronizedImmediate} from 'components/simple_tooltip';

import Avatar from 'components/widgets/users/avatar';

import './avatars.scss';

type StylingKeys = 'size';

type UserProps = ComponentProps<typeof Avatar> & {name: string};

export type Props = Pick<UserProps, StylingKeys> & {
    users: Omit<UserProps, StylingKeys>[];
    totalUsers?: number;
    breakAt?: number;
}

const OTHERS_DISPLAY_LIMIT = 99;

function Avatars({
    size,
    users,
    totalUsers = users.length,
    breakAt = Math.min(
        Math.max(users.length, totalUsers) > 4 ? 3 : 4,
        Math.min(users.length, totalUsers),
    ),
}: Props) {
    const displayUsers = users.slice(0, breakAt);
    const others = users.slice(breakAt);
    const othersOverflowCount = Math.max(
        totalUsers - displayUsers.length - others.length,
        0,
    );
    const nonDisplayCount = others.length + othersOverflowCount;

    const [immSync, setImmediate] = useSynchronizedImmediate();

    const {formatMessage} = useIntl();

    return (
        <div
            className={`Avatars Avatars___${size}`}
            onMouseLeave={() => setImmediate(false)}
        >
            {displayUsers.map(({name, ...user}) => (
                <SimpleTooltip
                    key={user.url}
                    id={`name-${user.username}`}
                    content={name}
                    {...immSync}
                >
                    <div>
                        <Avatar
                            size={size}
                            {...user}
                        />
                    </div>
                </SimpleTooltip>
            ))}
            {Boolean(others.length || othersOverflowCount) && (
                <SimpleTooltip
                    id={'names-overflow'}
                    {...immSync}
                    content={others.length ? formatMessage(
                        {
                            id: 'threading.avatars.overflowNames',
                            defaultMessage: `
                                {othersOverflowCount, plural,
                                    =0 {{overflowNames}}
                                    =1 {{overflowNames} and one other}
                                    other {{overflowNames} and # others}
                                }
                            `,
                        },
                        {
                            overflowNames: others.map((user) => user.name).join(', '),
                            othersOverflowCount,
                        },
                    ) : formatMessage(
                        {
                            id: 'threading.avatars.othersOverflow',
                            defaultMessage: `
                                {othersOverflowCount, plural,
                                    =1 {one other}
                                    other {# others}
                                }
                            `,
                        },
                        {othersOverflowCount},
                    )}
                >
                    <div>
                        <Avatar
                            size={size}
                        >
                            {nonDisplayCount > OTHERS_DISPLAY_LIMIT ?
                                `${OTHERS_DISPLAY_LIMIT}+` :
                                `+${nonDisplayCount}`}
                        </Avatar>
                    </div>
                </SimpleTooltip>
            )}
        </div>
    );
}

export default memo(Avatars);
