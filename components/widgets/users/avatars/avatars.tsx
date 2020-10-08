// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo, ComponentProps} from 'react';
import {useIntl} from 'react-intl';

import {t} from 'utils/i18n';

import SimpleTooltip, {useSynchronizedImmediate} from 'components/widgets/simple_tooltip';

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
    breakAt = Math.max(users.length, totalUsers) > 4 ? 3 : 4,
}: Props) {
    const displayUsers = users.slice(0, breakAt);
    const overflowUsers = users.slice(breakAt);
    const overflowUnnamedCount = Math.max(totalUsers - displayUsers.length - overflowUsers.length, 0);
    const nonDisplayCount = overflowUsers.length + overflowUnnamedCount;

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
                    <Avatar
                        size={size}
                        tabIndex={0}
                        {...user}
                    />
                </SimpleTooltip>
            ))}
            {Boolean(nonDisplayCount) && (
                <SimpleTooltip
                    id={'names-overflow'}
                    {...overlayProps}
                    content={overflowUsers.length ? formatMessage(
                        {
                            id: t('avatars.overflowUsers'),
                            defaultMessage: '{overflowUnnamedCount, plural, =0 {{names}} =1 {{names} and one other} other {{names} and # others}}',
                        },
                        {
                            overflowUnnamedCount,
                            names: overflowUsers.map((user) => user.name).join(', '),
                        },
                    ) : formatMessage(
                        {
                            id: t('avatars.overflowUnnamedOnly'),
                            defaultMessage: '{overflowUnnamedCount, plural, =1 {one other} other {# others}}',
                        },
                        {overflowUnnamedCount},
                    )}
                >
                    <Avatar
                        size={size}
                        tabIndex={0}
                        text={nonDisplayCount > OTHERS_DISPLAY_LIMIT ?
                            `${OTHERS_DISPLAY_LIMIT}+` :
                            `+${nonDisplayCount}`
                        }
                    />
                </SimpleTooltip>
            )}
        </div>
    );
}

export default memo(Avatars);
