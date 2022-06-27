// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState, HTMLAttributes, useEffect, useRef} from 'react';
import styled, {css} from 'styled-components';
import {useRouteMatch} from 'react-router-dom';
import {useSelector, useDispatch} from 'react-redux';

import {EmailOutlineIcon} from '@mattermost/compass-icons/components';

import Icon from '@mdi/react';
import {mdiMapClockOutline, mdiBadgeAccountOutline, mdiMapMarkerOutline, mdiCheckBold, mdiCheck, mdiClose, mdiPencil, mdiPencilOutline, mdiGithub, mdiTwitter, mdiWeb} from '@mdi/js';

import Pluggable from 'plugins/pluggable';

import MarkdownEdit from 'components/markdown/markdown_edit';
import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';

import Constants, {ModalIdentifiers} from 'utils/constants';

import {UserProfile} from '@mattermost/types/users';

import * as Utils from 'utils/utils';

import Avatar from 'components/widgets/users/avatar';

import Timestamp from 'components/timestamp';

import {Button, SecondaryButton} from 'components/buttons';

import {openModal} from 'actions/views/modals';

import UserSettingsModal from 'components/user_settings/modal';

import {RequireGrouped} from 'utils/conditional_types';

import {useUser, useUserProfileProp} from './hooks';

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
    const {params: {username: lookup}} = useRouteMatch<{username: string}>();
    const username = lookup.startsWith('@') ? lookup.slice(1) : lookup;
    const user = useUser(username);
    const meta = useUserDisplayMeta(user);
    const me = useSelector(getCurrentUser);
    const [content, setContent] = useUserProfileProp('overview', user?.id, '');
    const [location, setLocation] = useUserProfileProp('location', user?.id, '');
    const [github, setGithub] = useUserProfileProp('github', user?.id, '');
    const [twitter, setTwitter] = useUserProfileProp('twitter', user?.id, '');
    const [link, setLink] = useUserProfileProp('link', user?.id, '');

    const canEdit = user?.id === me.id;

    if (!user) {
        return null;
    }

    const openEditProfile = () => {
        if (!canEdit) {
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
                    {(location || canEdit) && (
                        <MetaItem
                            value={location}
                            setValue={canEdit ? setLocation : undefined}
                            icon={(
                                <Icon
                                    path={mdiMapMarkerOutline}
                                    size={'16px'}
                                />
                            )}
                        />
                    )}
                    {(github || canEdit) && (
                        <MetaItem
                            value={github}
                            setValue={canEdit ? setGithub : undefined}
                            icon={(
                                <Icon
                                    path={mdiGithub}
                                    size={'16px'}
                                />
                            )}
                        >
                            <a
                                target='_blank'
                                rel='noopener noreferrer'
                                href={`https://github.com/${github}`}
                            >
                                {github}
                            </a>
                        </MetaItem>
                    )}
                    {(twitter || canEdit) && (
                        <MetaItem
                            value={twitter}
                            setValue={canEdit ? setTwitter : undefined}
                            icon={(
                                <Icon
                                    path={mdiTwitter}
                                    size={'16px'}
                                />
                            )}
                        >
                            <a
                                target='_blank'
                                rel='noopener noreferrer'
                                href={`https://twitter.com/${twitter}`}
                            >
                                {twitter}
                            </a>
                        </MetaItem>
                    )}
                    {(link || canEdit) && (
                        <MetaItem
                            value={link}
                            setValue={canEdit ? setLink : undefined}
                            icon={(
                                <Icon
                                    path={mdiWeb}
                                    size={'16px'}
                                />
                            )}
                        >
                            <a
                                target='_blank'
                                rel='noopener noreferrer'
                                href={link}
                            >
                                {link}
                            </a>
                        </MetaItem>
                    )}
                    <Pluggable
                        key='profilePopoverPluggable3'
                        pluggableName='PopoverUserActions'
                        user={user}
                        hide={() => null}
                        status={null}
                    />
                    {canEdit && (
                        <SecondaryButton
                            css={`
                                height: 32px;
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
                {(content || canEdit) && (
                    <MarkdownEdit
                        value={content}
                        disabled={!canEdit}
                        onSave={setContent}
                        placeholder='Add content'
                    />
                )}
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
        / 1fr minmax(auto, 300px) minmax(auto, var(--content-max-width)) 1fr;
    ;
`;

type MetaItemProps = {
    icon?: React.ReactNode;
    children?: React.ReactNode;
} & RequireGrouped<{
    value: string;
    setValue?: (value: string) => void;
    isEditing?: boolean;
}>;

const MetaItem = ({
    icon,
    children,
    isEditing: externalIsEditing,
    value: inValue,
    setValue: setOutValue,
    ...attrs
}: MetaItemProps & HTMLAttributes<HTMLDivElement>) => {
    const [value, setValue] = useState(inValue);
    const [internalIsEditing, setInternalIsEditing] = useState(false);
    const editable = value != null && setOutValue != null;
    const inlineSave = externalIsEditing == null;
    const editing = externalIsEditing ?? internalIsEditing;

    const edit = () => {
        setInternalIsEditing(true);
    };

    const save = () => {
        if (value != null) {
            setOutValue?.(value);
        }
        setInternalIsEditing(false);
    };

    const cancel = () => {
        setInternalIsEditing(false);
        setValue(inValue);
    };

    if (!icon) {
        return (
            <div
                css={`
                    margin-bottom: 1rem;
                `}
            >
                {value}
            </div>
        );
    }

    return (
        <MetaItemRoot
            {...attrs}
            editing={editing}
        >
            {icon}
            {editable && editing ? (
                <>
                    <input
                        type='text'
                        value={value}
                        onChange={({target}) => target.value && setValue(target.value)}
                        css={`
                            background-color: rgba(var(--center-channel-bg-rgb), 1);
                            border: none;
                            border-bottom: 1px solid rgba(var(--center-channel-color-rgb), 0.72);
                            font-size: 14px;
                            padding: 1px 0;
                        `}
                        autoFocus={true}
                        onFocus={(e) => e.target.select()}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                save();
                            } else if (e.key === 'Escape') {
                                cancel();
                            }
                        }}
                    />
                    {inlineSave && (
                        <>
                            <MetaItemButton onClick={save}>
                                <Icon
                                    path={mdiCheck}
                                    size={'16px'}
                                />
                            </MetaItemButton>
                            <MetaItemButton onClick={cancel}>
                                <Icon
                                    path={mdiClose}
                                    size={'16px'}
                                />
                            </MetaItemButton>
                        </>
                    )}
                </>
            ) : (
                children ?? inValue
            )}
            {editable && !editing && inlineSave && (
                <MetaItemButton onClick={edit}>
                    <Icon
                        path={mdiPencilOutline}
                        size={'16px'}
                    />
                </MetaItemButton>
            )}
        </MetaItemRoot>
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

const MetaItemButton = styled(Button).attrs({className: 'btn btn-transparent'})`
    width: 20px;
    height: 20px;
    && {
        padding: 2px;
    }
`;

const MetaItemRoot = styled.div<{editing: boolean}>`
    display: flex;
    align-items: center;
    gap: 4px;
    > svg {
        position: relative;
        bottom: -1px;
    }

    ${({editing}) => !editing && css`
        padding: 1px 0 2px;

        ${MetaItemButton} {
            opacity: 0;
        }

        &:hover,
        &:focus-within {
            ${MetaItemButton} {
                opacity: 1;
            }
        }
    `}
`;
