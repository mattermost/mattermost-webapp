// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {openModal} from 'actions/views/modals';
import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';
import React, {useEffect, useRef} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {useParams, useHistory} from 'react-router-dom';
import {ModalIdentifiers} from 'utils/constants';

import UserSettingsModal from 'components/user_settings/modal';

import {FormattedMessage} from 'react-intl';

import {useUser, useUserCustomStatus, useUserDisplayMeta, useUserIdFromUsername} from './hooks';

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
    const status = useUserCustomStatus(user?.id);
    const display = useUserDisplayMeta(user);
    const me = useSelector(getCurrentUser);
    const canEdit = user?.id === me.id;

    return (
        <>
            {display.name}
            {canEdit && <EditProfileBtn/>}
        </>
    );
};

const EditProfileBtn = () => {
    const dispatch = useDispatch();

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
                display: inline-block;
                height: 32px;
                margin: 1rem;
            `}
            onClick={openEditProfile}
        >
            <FormattedMessage
                id='people.user_profile.edit'
                defaultMessage='Edit Profile'
            />
        </button>
    );
};

export default Profile;
