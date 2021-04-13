// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo, ComponentProps} from 'react';
import {useIntl} from 'react-intl';
import {useSelector} from 'react-redux';

import {$ID} from 'mattermost-redux/types/utilities';
import {UserProfile} from 'mattermost-redux/types/users';
import {getUser as selectUser, makeDisplayNameGetter} from 'mattermost-redux/selectors/entities/users';

import {GlobalState} from 'types/store';

import {t} from 'utils/i18n';
import {imageURLForUser} from 'utils/utils';

import SimpleTooltip, {useSynchronizedImmediate} from 'components/widgets/simple_tooltip';
import Avatar from 'components/widgets/users/avatar';

import './avatars.scss';

type Props = {
    userIds: Array<$ID<UserProfile>>;
    totalUsers?: number;
    fetchMissing?: boolean;
    breakAt?: number;
    size?: ComponentProps<typeof Avatar>['size'];
};

const OTHERS_DISPLAY_LIMIT = 99;

function countMeta<T>(
    items: T[], total = items.length,
): [T[], T[], {overflowUnnamedCount: number; nonDisplayCount: number}] {
    const breakAt = Math.max(items.length, total) > 4 ? 3 : 4;

    const displayItems = items.slice(0, breakAt);
    const overflowItems = items.slice(breakAt);

    const overflowUnnamedCount = Math.max(total - displayItems.length - overflowItems.length, 0);
    const nonDisplayCount = overflowItems.length + overflowUnnamedCount;

    return [displayItems, overflowItems, {overflowUnnamedCount, nonDisplayCount}];
}

const displayNameGetter = makeDisplayNameGetter();

function UserAvatar({
    userId,
    overlayProps,
    ...props
}: {
    userId: $ID<UserProfile>;
    overlayProps: Partial<ComponentProps<typeof SimpleTooltip>>;
} & ComponentProps<typeof Avatar>) {
    const user = useSelector((state: GlobalState) => selectUser(state, userId));
    const name = useSelector((state: GlobalState) => displayNameGetter(state, true)(user));
    const url = imageURLForUser(userId, user.last_picture_update);

    return (
        <SimpleTooltip
            id={`name-${user.username}`}
            content={name}
            {...overlayProps}
        >
            <Avatar
                url={url}
                tabIndex={0}
                {...props}
            />
        </SimpleTooltip>
    );
}

function Avatars({
    size,
    userIds,
    totalUsers,
}: Props) {
    const {formatMessage} = useIntl();
    const [overlayProps, setImmediate] = useSynchronizedImmediate();
    const [displayUserIds, overflowUserIds, {overflowUnnamedCount, nonDisplayCount}] = countMeta(userIds, totalUsers);
    const overflowNames = useSelector((state: GlobalState) => {
        return userIds.map((userId) => displayNameGetter(state, true)(selectUser(state, userId))).join(', ');
    });

    return (
        <div
            className={`Avatars Avatars___${size}`}
            onMouseLeave={() => setImmediate(false)}
        >
            {displayUserIds.map((id) => (
                <UserAvatar
                    key={id}
                    userId={id}
                    size={size}
                    tabIndex={0}
                    overlayProps={overlayProps}
                />
            ))}
            {Boolean(nonDisplayCount) && (
                <SimpleTooltip
                    id={'names-overflow'}
                    {...overlayProps}
                    content={overflowUserIds.length ? formatMessage(
                        {
                            id: t('avatars.overflowUsers'),
                            defaultMessage: '{overflowUnnamedCount, plural, =0 {{names}} =1 {{names} and one other} other {{names} and # others}}',
                        },
                        {
                            overflowUnnamedCount,
                            names: overflowNames,
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
                        text={nonDisplayCount > OTHERS_DISPLAY_LIMIT ? `${OTHERS_DISPLAY_LIMIT}+` : `+${nonDisplayCount}`}
                    />
                </SimpleTooltip>
            )}
        </div>
    );
}

export default memo(Avatars);
