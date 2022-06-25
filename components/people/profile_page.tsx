// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState, HTMLAttributes} from 'react';
import styled, {css} from 'styled-components';
import {useRouteMatch} from 'react-router-dom';
import {useSelector, useDispatch} from 'react-redux';

import {EmailOutlineIcon} from '@mattermost/compass-icons/components';

import Icon from '@mdi/react';
import {mdiMapClockOutline, mdiBadgeAccountOutline} from '@mdi/js';

import Pluggable from 'plugins/pluggable';

import MarkdownEdit from 'components/markdown/markdown_edit';
import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';

import Constants, {ModalIdentifiers} from 'utils/constants';

import {UserProfile} from '@mattermost/types/users';

import * as Utils from 'utils/utils';

import Avatar from 'components/widgets/users/avatar';

import Timestamp from 'components/timestamp';

import {SecondaryButton} from 'components/buttons';

import {openModal} from 'actions/views/modals';

import UserSettingsModal from 'components/user_settings/modal';

import {useUser} from './hooks';

const useUserDisplayMeta = (user: UserProfile | null) => {
    if (!user) {
        return {};
    }
    let name = Utils.getFullName(user);
    if (name && user.nickname) {
        name += ` (${user.nickname})`;
    } else if (user.nickname) {
        name = user.nickname;
    }

    const position = (user?.position || '').substring(
        0,
        Constants.MAX_POSITION_LENGTH,
    );

    const profileImageUrl = Utils.imageURLForUser(user.id, user.last_picture_update);

    return {
        name,
        position,
        profileImageUrl,
    };
};

const ProfilePage = () => {
    const dispatch = useDispatch();
    const [content, setContent] = useState('');
    const {params: {username: lookup}} = useRouteMatch<{username: string}>();
    const username = lookup.startsWith('@') ? lookup.slice(1) : lookup;
    const user = useUser(username);
    const meta = useUserDisplayMeta(user);
    const me = useSelector(getCurrentUser);

    if (!user) {
        return null;
    }

    const isMe = user.id === me.id;

    const openEditProfile = () => {
        if (!isMe) {
            return;
        }

        dispatch(openModal({
            modalId: ModalIdentifiers.USER_SETTINGS,
            dialogType: UserSettingsModal,
            dialogProps: {isContentProductSettings: false},
        }));
    };

    return (
        <ProfilePageRoot>
            <Hero/>
            <Aside>
                <Profile>
                    <Avatar
                        url={meta.profileImageUrl}
                        size='xxl'
                        username={user.username}
                        css={`
                            border: 4px solid rgba(var(--center-channel-color-rgb), 0.72);
                            height: 192px !important;
                            width: 192px !important;
                            margin: 0 auto;
                            display: block;
                        `}
                    />
                    <h2
                        css={`
                            font-size: 22px;
                            font-weight: 700;
                        `}
                    >
                        {meta.name}
                        <span
                            css={`
                                display: block;
                                font-size: 20px;
                                font-weight: 500;
                                line-height: 1;
                                color: rgba(var(--center-channel-color-rgb), 0.72);
                            `}
                        >
                            {`@${user.username}`}
                        </span>
                    </h2>
                    <MetaItem
                        icon={(
                            <Icon
                                path={mdiBadgeAccountOutline}
                                size={'16px'}
                            />
                        )}
                    >
                        {meta.position}
                    </MetaItem>
                    <MetaItem
                        icon={(
                            <EmailOutlineIcon
                                size={16}
                                color='var(--center-channel-color)'
                            />
                        )}
                    >
                        <a href={`mailto:${user.email}`}>{user.email}</a>
                    </MetaItem>
                    <MetaItem
                        icon={(
                            <Icon
                                path={mdiMapClockOutline}
                                size={'16px'}
                            />
                        )}
                    >
                        <Timestamp
                            useRelative={false}
                            useDate={false}
                            userTimezone={user.timezone}
                            useTime={{
                                hour: 'numeric',
                                minute: 'numeric',
                                timeZoneName: 'short',
                            }}
                        />
                    </MetaItem>
                    <Pluggable
                        key='profilePopoverPluggable3'
                        pluggableName='PopoverUserActions'
                        user={user}
                        hide={() => null}
                        status={null}
                    />
                    {isMe && (
                        <SecondaryButton
                            css={`
                                height: 24px;
                                width: 100%;
                                justify-content: center;
                                margin: 2rem 0;
                            `}
                            onClick={openEditProfile}
                        >
                            {'Edit Profile'}
                        </SecondaryButton>
                    )}

                </Profile>
            </Aside>
            <Content>
                <h3 css={css`font-size: 18px;`}>{'Overview'}</h3>
                <MarkdownEdit
                    value={content}
                    onSave={setContent}
                    placeholder='Add content'
                />
            </Content>
        </ProfilePageRoot>
    );
};

export default ProfilePage;

const ProfilePageRoot = styled.div`
    display: grid;
    min-height: 100%;
    gap: 4rem;

    --bar-height: 60px;
    --content-max-width: 680px;

    /* === standard-full === */
    grid-template:
        'hero hero hero hero' 80px
        '. aside content .' 1fr
        / 1fr minmax(200px, auto) minmax(auto, var(--content-max-width)) 1fr;
    ;
`;

const MetaItem = ({icon, children, ...attrs}: {icon?: React.ReactNode; children: React.ReactNode} & HTMLAttributes<HTMLDivElement>) => {
    if (!icon) {
        return (
            <div
                css={`
                    margin-bottom: 1rem;
                `}
            >
                {children}
            </div>
        );
    }

    return (
        <div
            css={`
                display: flex;
                align-items: center;
                gap: 4px;
                > svg {
                    position: relative;
                    bottom: -1px;
                }
            `}
            {...attrs}
        >
            {icon}
            {children}
        </div>
    );
};

const Profile = styled.div`

`;

const Hero = styled.header`

`;

const Aside = styled.aside`
    grid-area: aside;
`;

const Content = styled.main`
    grid-area: content;
`;
