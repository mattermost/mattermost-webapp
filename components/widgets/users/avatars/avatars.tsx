// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo, ComponentProps} from 'react';
import {useIntl} from 'react-intl';

import {t} from 'utils/i18n';

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
        users.length > 4 ? 3 : 4,
        Math.max(users.length, totalUsers),
    ),
}: Props) {
    const displayUsers = users.slice(0, breakAt);
    const others = users.slice(breakAt);
    const othersOverflowCount = Math.max(
        totalUsers - displayUsers.length - others.length,
        0,
    );
    const nonDisplayCount = others.length + othersOverflowCount;

    const [overlayProps, setImmediate] = useSynchronizedImmediate();

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
                    {...overlayProps}
                >
                    <div>
                        <Avatar
                            size={size}
                            tabIndex={0}
                            {...user}
                        />
                    </div>
                </SimpleTooltip>
            ))}
            {Boolean(others.length || othersOverflowCount) && (
                <SimpleTooltip
                    id={'names-overflow'}
                    {...overlayProps}
                    content={others.length ? formatMessage(
                        {
                            id: t('threading.avatars.overflowNames'),
                            defaultMessage: `{othersOverflowCount, plural,
                                =0 {{overflowNames}}
                                =1 {{overflowNames} and one other}
                                other {{overflowNames} and # others}
                            }`,
                        },
                        {
                            othersOverflowCount,
                            overflowNames: others.map((user) => user.name).join(', '),
                        },
                    ) : formatMessage(
                        {
                            id: t('threading.avatars.othersOverflowOnly'),
                            defaultMessage: `{othersOverflowCount, plural,
                                =1 {one other}
                                other {# others}
                            }`,
                        },
                        {othersOverflowCount},
                    )}
                >
                    <div>
                        <Avatar
                            size={size}
                            tabIndex={0}
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
