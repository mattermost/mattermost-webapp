// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {useIntl} from 'react-intl';

import {General} from 'mattermost-redux/constants';

import OverlayTrigger from 'components/overlay_trigger';
import StatusIcon from 'components/status_icon';
import Tooltip from 'components/tooltip';
import Avatar from 'components/widgets/users/avatar';

import Constants from 'utils/constants';

import {useUserCustomStatus, useUserStatus} from 'hooks/users';

import CustomStatusEmoji from 'components/custom_status/custom_status_emoji';
import ExpiryTime from 'components/custom_status/expiry_time';

import {UserProfile} from '@mattermost/types/users';

import './profile_card.scss';
import {useUserDisplayMeta} from '../profile/hooks';

type ProfileCardProps = {
    user: UserProfile;
    role?: 'system_admin' | 'system_user' | 'system_guest';
    bio?: string;
    location?: string;
    teams?: string[];
    groups?: string[];
    onSubmit?: () => void;
} & ProfileDisplaySettings;

type ProfileDisplaySettings = {
    showRole?: boolean;
    showBio?: boolean;
    showLocation?: boolean;
    showTeams?: boolean;
    showGroups?: boolean;
}

const getSystemRole = (user: UserProfile) => {
    let role: ProfileCardProps['role'];

    if (user.roles.includes(General.SYSTEM_ADMIN_ROLE)) {
        role = General.SYSTEM_ADMIN_ROLE as 'system_admin';
    } else if (user.roles.includes(General.SYSTEM_GUEST_ROLE)) {
        role = General.SYSTEM_ADMIN_ROLE as 'system_guest';
    } else if (user.roles.includes(General.SYSTEM_USER_ROLE)) {
        role = General.SYSTEM_USER_ROLE as 'system_admin';
    }

    return role;
};

const ProfileCard = ({
    user,
    role = getSystemRole(user),
    bio,
    location,
    teams,
    groups,
    showRole = role === General.SYSTEM_ADMIN_ROLE || role === General.SYSTEM_GUEST_ROLE,
    showBio = Boolean(bio),
    showLocation = Boolean(location),
    showTeams = Boolean(teams?.length),
    showGroups = Boolean(groups?.length),
    onSubmit,
}: ProfileCardProps) => {
    const {formatMessage} = useIntl();

    const {id, username, position} = user;
    const extended = showBio || showLocation || showTeams || showGroups;

    const display = useUserDisplayMeta(user);
    const status = useUserStatus(user.id);
    const customStatus = useUserCustomStatus(user?.id);

    const getRole = () => {
        switch (role) {
        case General.SYSTEM_ADMIN_ROLE:
            return formatMessage({id: 'admin.permissions.roles.system_admin.name', defaultMessage: 'System Admin'});
        case General.SYSTEM_GUEST_ROLE:
            return formatMessage({id: 'admin.system_users.guest', defaultMessage: 'Guest'});
        case General.SYSTEM_USER_ROLE:
        default:
            return formatMessage({id: 'admin.permissions.roles.system_user.name', defaultMessage: 'System User'});
        }
    };

    const getExtended = () => {
        const extended = [];

        if (showBio) {
            extended.push({
                id: 'bio',
                title: formatMessage({id: 'people.bio.title', defaultMessage: 'Bio'}),
                detail: bio,
            });
        }

        if (showLocation) {
            extended.push({
                id: 'location',
                title: formatMessage({id: 'people.location.title', defaultMessage: 'Location'}),
                detail: location,
            });
        }

        if (showTeams) {
            extended.push({
                id: 'teams',
                title: formatMessage({id: 'people.teams.title', defaultMessage: 'Teams'}),
                detail: teams && teams.length > 1 ? (
                    formatMessage(
                        {id: 'people.teams.detail', defaultMessage: '{firstTeam}, +{restCount} more'},
                        {firstTeam: teams[0], restCount: teams.length - 1},
                    )
                ) : (
                    teams?.[0]
                ),
            });
        }

        if (showGroups) {
            extended.push({
                id: 'groups',
                title: formatMessage({id: 'people.groups.title', defaultMessage: 'Groups'}),
                detail: groups && groups.length > 1 ? (
                    formatMessage(
                        {id: 'people.groups.detail', defaultMessage: '{firstGroup}, +{restCount} more'},
                        {firstGroup: groups[0], restCount: groups.length - 1},
                    )
                ) : (
                    groups?.[0]
                ),
            });
        }

        return extended.map(({id, title, detail}) => (
            <div
                className='profile-card__extended__item'
                key={`profile-card-extended-${id}`}
            >
                <span className='profile-card__extended__title'>{title}</span>
                <OverlayTrigger
                    delayShow={Constants.OVERLAY_TIME_DELAY}
                    placement='top'
                    overlay={<Tooltip id={`profileCardExtendedTooltip-${id}`}>{detail}</Tooltip>}
                >
                    <span className={`profile-card__detail profile-card__extended__detail detail-${id}`}>{detail}</span>
                </OverlayTrigger>
            </div>
        ));
    };

    const handleOnClick = (e: React.MouseEvent | React.KeyboardEvent) => {
        e.preventDefault();

        onSubmit?.();
    };

    return (
        <div
            className='profile-card'
            key={`profile-card-${id}`}
            onClick={handleOnClick}
        >
            {showRole && (
                <span className='profile-card__role'>
                    {getRole()}
                </span>
            )}
            <div className='profile-card__image'>
                <Avatar
                    size='xxl'
                    username={username}
                    url={display.profileImageUrl}
                />
                {status && (
                    <StatusIcon
                        className='status profile-card__status'
                        status={status}
                        button={true}
                    />
                )}
            </div>
            {customStatus && (
                <div
                    css={`
                        display: flex;
                        place-content: center;
                        margin-bottom: 1rem;
                    `}
                >
                    <CustomStatusEmoji
                        showTooltip={false}
                        emojiStyle={{marginRight: '6px'}}
                        userID={user.id}
                        emojiSize={20}
                    />
                    <span>
                        {customStatus.text}
                        {customStatus.expires_at ? (
                            <ExpiryTime
                                css={`
                                    opacity: 0.7;
                                    font-size: 12px;
                                    margin-left: 6px;
                                `}
                                time={customStatus.expires_at}
                                withinBrackets={true}
                            />
                        ) : null}
                    </span>

                </div>
            )}
            <OverlayTrigger
                delayShow={Constants.OVERLAY_TIME_DELAY}
                placement='top'
                overlay={<Tooltip id='fullNameTooltip'>{display.name}</Tooltip>}
            >
                <span className='profile-card__detail profile-card__fullname'>{display.name}</span>
            </OverlayTrigger>
            <span className='profile-card__detail'>{`@${username}`}</span>
            <OverlayTrigger
                delayShow={Constants.OVERLAY_TIME_DELAY}
                placement='top'
                overlay={<Tooltip id='positionTooltip'>{position}</Tooltip>}
            >
                <span className='profile-card__detail'>{position}</span>
            </OverlayTrigger>
            {extended && (
                <div className='profile-card__extended'>
                    {getExtended()}
                </div>
            )}
        </div>
    );
};

export default ProfileCard;
