// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {ComponentProps} from 'react';
import {FormattedMessage, useIntl} from 'react-intl';
import {Link} from 'react-router-dom';

import {General} from 'mattermost-redux/constants';

import Highlight from 'components/admin_console/highlight';
import StatusIcon from 'components/status_icon';
import Tooltip from 'components/tooltip';
import Avatar from 'components/widgets/users/avatar';

import {useUserCustomStatus, useUserStatus} from 'hooks/users';

import CustomStatusEmoji from 'components/custom_status/custom_status_emoji';
import ExpiryTime from 'components/custom_status/expiry_time';
import SimpleTooltip from 'components/widgets/simple_tooltip/simple_tooltip';

import {CustomStatusDuration, UserProfile} from '@mattermost/types/users';

import './profile_card.scss';
import {useUserDisplayMeta} from '../profile/hooks';

type ProfileCardProps = {
    user: UserProfile;
    teams?: string[];
    groups?: string[];
    linked?: boolean;
    actions?: React.ReactNode;
    filter?: string;
    className?: string;

    showRole?: boolean;
    showBio?: boolean;
    showLocation?: boolean;
    showTeams?: boolean;
    showGroups?: boolean;
}

const ProfileCard = ({
    user,
    filter = '',
    linked,
    actions,
    className,
    ...props
}: ProfileCardProps) => {
    const {formatMessage} = useIntl();

    const {id, username, position} = user;

    const display = useUserDisplayMeta(user);
    const status = useUserStatus(user.id);
    const customStatus = useUserCustomStatus(user?.id);

    const {
        teams,
        groups,
        showRole = Boolean(display.role),
        showBio = Boolean(user.bio),
        showLocation,
        showTeams = Boolean(teams?.length),
        showGroups = Boolean(groups?.length),
    } = props;

    const extended = showBio || showLocation || showTeams || showGroups;

    const getExtended = () => {
        const extended: Array<{id: string; title: string; detail: React.ReactNode}> = [];

        if (showBio) {
            extended.push({
                id: 'bio',
                title: formatMessage({id: 'people.bio.title', defaultMessage: 'Bio'}),
                detail: user.bio,
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
                <SimpleTooltip
                    id={`profileCardExtendedTooltip-${id}`}
                    placement='top'
                    content={detail}
                >
                    <span className={`profile-card__detail profile-card__extended__detail detail-${id}`}>{detail}</span>
                </SimpleTooltip>
            </div>
        ));
    };

    return (
        <MaybeLink
            className={`profile-card ${className}`}
            key={`profile-card-${id}`}
            to={linked ? (location) => ({pathname: `/people/${user.username}`, state: {from: location.pathname}}) : undefined}
        >
            <div className='profile-card__header'>
                {showRole && display.role && (
                    <span className='profile-card__role'>
                        {display.role}
                    </span>
                )}
            </div>
            <div className='profile-card__main'>
                <div className='profile-card__image'>
                    <Avatar
                        size='xxl'
                        username={username}
                        url={display.profileImageUrl}
                        tabIndex={-1}
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
                            {customStatus.expires_at && customStatus.duration !== CustomStatusDuration.DONT_CLEAR && (
                                <ExpiryTime
                                    css={`
                                            opacity: 0.7;
                                            font-size: 12px;
                                            margin-left: 6px;
                                        `}
                                    time={customStatus.expires_at}
                                    withinBrackets={true}
                                />
                            )}
                        </span>

                    </div>
                )}
                <Highlight
                    filter={filter}
                    className='profile-card__highlighted'
                >
                    <SimpleTooltip
                        id='fullNameTooltip'
                        placement='top'
                        content={<Tooltip >{display.name}</Tooltip>}
                    >
                        <span className='profile-card__detail profile-card__fullname'>{display.name}</span>
                    </SimpleTooltip>
                    <span className='profile-card__detail username'>{`@${username}`}</span>
                    <SimpleTooltip
                        placement='top'
                        id='positionTooltip'
                        content={position}
                    >
                        <span className='profile-card__detail'>{position}</span>
                    </SimpleTooltip>
                    {extended && (
                        <div className='profile-card__extended'>
                            {getExtended()}
                        </div>
                    )}
                </Highlight>
            </div>
            {actions && (
                <div className='profile-card__actions'>
                    {actions}
                </div>
            )}
        </MaybeLink>
    );
};

type MaybeLinkProps = {
    children: React.ReactNode;
    className: string;
    to?: ComponentProps<typeof Link>['to'];
};
const MaybeLink = ({children, className, to}: MaybeLinkProps) => {
    if (to) {
        return (
            <Link
                css={`
                    color: var(--center-channel-text) !important;
                    &:hover {
                        text-decoration: none;
                    }
                `}
                className={className}
                to={to}
            >
                {children}
            </Link>
        );
    }

    return (
        <div className={className}>
            {children}
        </div>
    );
};

export default ProfileCard;
