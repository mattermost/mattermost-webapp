// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect, useRef} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {useIntl, FormattedMessage} from 'react-intl';
import {useParams, useHistory, Link, useLocation} from 'react-router-dom';

import styled from 'styled-components';

import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';

import './profile.scss';

import {openModal} from 'actions/views/modals';

import {ModalIdentifiers} from 'utils/constants';

import UserSettingsModal from 'components/user_settings/modal';

import {useUserStatus} from 'hooks/users';

import ProfileCard from '../profile_card/profile_card';

import TimeZoneSelectMap from '../timezone_map/timezone_map';

import SendMessageButton from './send_message_button';

import {useUser, useUserIdFromUsername} from './hooks';

/**
 * Get user from route parameter and keep url consistent when username changes.
 *
 */
const useUserFromRoute = () => {
    const history = useHistory();
    const {username} = useParams<{username: string}>();
    const userId = useUserIdFromUsername(username);
    const userIdRef = useRef(userId);

    const [user] = useUser(userId ?? userIdRef.current);

    useEffect(() => {
        if (userId) {
            userIdRef.current = userId;
        }
    }, [userId]);

    useEffect(() => {
        if (user && user.username !== username) {
            // keep synced
            history.replace(`/people/${user.username}`);
        }
    }, [user?.username]);

    return user;
};

const Profile = () => {
    const user = useUserFromRoute();
    const currentUser = useSelector(getCurrentUser);
    const {state} = useLocation<{from?: string}>();
    const history = useHistory();
    const userStatus = useUserStatus(user?.id);

    return user && (
        <div className='UserProfile'>
            <div className='UserProfile__header-card'>
                <div className='UserProfile__header-card__top-section'>
                    <Link
                        className='UserProfile__header-card__top-section__back'
                        to='/people'
                        onClick={(state?.from === '/people' && history?.length) ? (e) => {
                            e.preventDefault();
                            history.goBack();
                        } : undefined}
                    >
                        <i className='icon-arrow-left'/>
                        <FormattedMessage
                            id={'user-profile.header.back-text'}
                            defaultMessage={'Back to directory'}
                        />
                    </Link>
                </div>
                {user.timezone?.automaticTimezone && (
                    <TimeZoneSelectMap
                        timeZoneName={user.timezone?.automaticTimezone || undefined}
                        userStatus={userStatus!}
                        userTimezone={user.timezone}
                    />
                )}
            </div>
            <div className='UserProfile__bottom-card'>
                <ProfileCard
                    user={user}
                    css={`
                        width: 320px;
                    `}
                    actions={user.id === currentUser.id ? (
                        <EditProfileBtn/>
                    ) : (
                        <>
                            <SendMessageButton user={user}/>
                        </>
                    )}
                />
                <MainContent
                    css={`
                        width: 600px;
                        min-height: 300px;
                    `}
                    id={'user-profile-details-card'}
                />
            </div>
        </div>
    );
};

export default Profile;

const EditProfileBtn = () => {
    const dispatch = useDispatch();
    const {formatMessage} = useIntl();

    const openEditProfile = () => {
        dispatch(openModal({
            modalId: ModalIdentifiers.USER_SETTINGS,
            dialogType: UserSettingsModal,
            dialogProps: {isContentProductSettings: false},
        }));
    };

    return (
        <button
            css={`
                width: 100%;
            `}
            className={'btn style--none btn-primary'}
            onClick={openEditProfile}
        >
            {formatMessage({id: 'people.user_profile.edit', defaultMessage: 'Edit Profile'})}
        </button>
    );
};

const MainContent = styled.div`
    padding: 28px 32px;
    border: 1px solid rgba(var(--center-channel-color-rgb), 0.08);
    background: var(--center-channel-bg);
    border-radius: 8px;
    box-shadow: 0 2px 3px rgba(0, 0, 0, 0.08);
`;
