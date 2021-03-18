// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo, ComponentProps, useEffect} from 'react';
import {useIntl} from 'react-intl';
import {useSelector, useDispatch} from 'react-redux';

import {$ID} from 'mattermost-redux/types/utilities';
import {UserProfile} from 'mattermost-redux/types/users';

import {getUser, makeGetDisplayName} from 'mattermost-redux/selectors/entities/users';
import {getProfilesByIds} from 'mattermost-redux/actions/users';

import {GlobalState} from 'types/store';

import {t} from 'utils/i18n';

import SimpleTooltip, {useSynchronizedImmediate} from 'components/widgets/simple_tooltip';

import Avatar from 'components/widgets/users/avatar';

import './avatars.scss';
import {imageURLForUser} from 'utils/utils';

type StylingKeys = 'size';

type UserProps = ComponentProps<typeof Avatar> & {name: string};
type AvatarProps = Omit<UserProps, StylingKeys>;
type Participants = Array<{id: $ID<UserProfile>}>;

type InputUsers =
    {participants: Participants; users?: undefined} |
    {users: AvatarProps[]; participants?: undefined};

export type Props = Pick<UserProps, StylingKeys> & InputUsers & {
    totalUsers?: number;
    breakAt?: number;
}

const OTHERS_DISPLAY_LIMIT = 99;

function selectUsers(
    state: GlobalState,
    users: InputUsers['users'],
    participants: InputUsers['participants'],
): null | {users: AvatarProps[]; missingProfiles?: string[]} {
    if (users) {
        return {users};
    }
    if (!participants) {
        return null;
    }

    const getDisplayName = makeGetDisplayName();

    return participants.reduce<NonNullable<ReturnType<typeof selectUsers>>>((result, {id}) => {
        const user = getUser(state, id);

        if (!user) {
            result.missingProfiles?.push(id);
            return result;
        }

        result.users.push({
            username: user.username,
            name: getDisplayName(state, id, true),
            url: imageURLForUser(id, user.last_picture_update),
        });

        return result;
    }, {users: [], missingProfiles: []});
}

function Avatars({
    size,
    participants,
    users: unparsedUsers,
}: Props) {
    const {formatMessage} = useIntl();
    const dispatch = useDispatch();
    const result = useSelector((state: GlobalState) => selectUsers(state, unparsedUsers, participants));

    useEffect(() => {
        if (result?.missingProfiles?.length) {
            dispatch(getProfilesByIds(result.missingProfiles));
        }
    }, [result?.missingProfiles?.length]);

    if (!result?.users?.length) {
        return null;
    }
    const {users} = result;

    const totalUsers = users.length;
    const breakAt = Math.max(users.length, totalUsers) > 4 ? 3 : 4;

    const displayUsers = users.slice(0, breakAt);
    const overflowUsers = users.slice(breakAt);
    const overflowUnnamedCount = Math.max(totalUsers - displayUsers.length - overflowUsers.length, 0);
    const nonDisplayCount = overflowUsers.length + overflowUnnamedCount;

    const [overlayProps, setImmediate] = useSynchronizedImmediate();

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
                        text={nonDisplayCount > OTHERS_DISPLAY_LIMIT ? `${OTHERS_DISPLAY_LIMIT}+` : `+${nonDisplayCount}`}
                    />
                </SimpleTooltip>
            )}
        </div>
    );
}

export default memo(Avatars);
