// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {useIntl} from 'react-intl';

import {General} from 'mattermost-redux/constants';

import OverlayTrigger from 'components/overlay_trigger';
import StatusIcon from 'components/status_icon';
import Tooltip from 'components/tooltip';
import Avatar from 'components/widgets/users/avatar';

import CallButton from 'plugins/call_button';

import Constants from 'utils/constants';
import * as Utils from 'utils/utils';

import {UserProfile} from '@mattermost/types/users';

import SendMessageButton from './send_message_button';
import './profile_card.scss';

type ProfileCardProps = {
    user: UserProfile;
    avatarSrc: string;
    status?: 'online' | 'away' | 'dnd' | 'offline';
    role: 'system_admin' | 'system_user' | 'system_guest';
    bio?: string;
    location?: string;
    teams?: string[];
    groups?: string[];
    showRole?: boolean;
    showBio?: boolean;
    showLocation?: boolean;
    showTeams?: boolean;
    showGroups?: boolean;
    actionButtons?: boolean;
    onSubmit?: () => void;
}

const ProfileCard = ({
    user,
    avatarSrc,
    status,
    role,
    bio,
    location,
    teams,
    groups,
    showRole,
    showBio,
    showLocation,
    showTeams,
    showGroups,
    actionButtons,
    onSubmit,
}: ProfileCardProps) => {
    const {formatMessage} = useIntl();

    const {id, username, position} = user;
    const fullname = Utils.getFullName(user);
    const extended = showBio || showLocation || showTeams || showGroups;

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

        if (onSubmit) {
            onSubmit();
        }
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
                    url={avatarSrc}
                />
                <StatusIcon
                    className='status profile-card__status'
                    status={status}
                    button={true}
                />
            </div>
            <OverlayTrigger
                delayShow={Constants.OVERLAY_TIME_DELAY}
                placement='top'
                overlay={<Tooltip id='fullNameTooltip'>{fullname}</Tooltip>}
            >
                <span className='profile-card__detail profile-card__fullname'>{fullname}</span>
            </OverlayTrigger>
            <span className='profile-card__detail username'>{username}</span>
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
            {/* check if same user as current user then don't show this section */}
            {actionButtons && (
                <div className='profile-card__action-buttons'>
                    <SendMessageButton
                        user={user}
                        buttonText={formatMessage({id: 'people.teams.message', defaultMessage: 'Message'})}
                    />
                    <CallButton/>
                </div>
            )}
        </div>
    );
};

export default ProfileCard;
