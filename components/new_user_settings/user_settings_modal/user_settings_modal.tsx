// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {useState} from 'react';

import {FormattedMessage} from 'react-intl';
import {useDispatch} from 'react-redux';

import {
    BellOutlineIcon,
    CloseIcon,
    DockLeftIcon,
    ForumOutlineIcon,
    GlobeIcon,
    MagnifyIcon,
    PaletteOutlineIcon,
    TuneIcon,
} from '@mattermost/compass-icons/components';

import SidebarList from '../sidebar/sidebar_list';
import {ModalIdentifiers} from 'utils/constants';
import UserSettingsNotifications from '../notifications/user_settings_notifications';
import UserSettingsMessagesAndMedia from '../messages&media/user_settings_messages&media';
import LanguageAndRegion from '../language&region/language&region';
import UserSettingsSidebar from '../user_settings_sidebar/user_settings_sidebar';
import UserSettingsAdvanced from '../user_settings_advanced/user_settings_advanced';
import {UnsavedChangesModal} from '../unsaved_changes_modal';
import {closeModal} from 'actions/views/modals';
import './user_settings_modal.scss';
import ConfirmModal from '../../confirm_modal';

export const sideBarListData = [
    {
        icon: (
            <BellOutlineIcon
                size={18}
                color={'currentcolor'}
            />),
        title: 'Notifications',
    },
    {
        icon: (
            <PaletteOutlineIcon
                size={18}
                color={'currentcolor'}
            />),
        title: 'Themes',
    },
    {
        icon: (
            <ForumOutlineIcon
                size={18}
                color={'currentcolor'}
            />),
        title: 'Messages & media',
    },
    {
        icon: (
            <GlobeIcon
                size={18}
                color={'currentcolor'}
            />),
        title: 'Language & time',
    },
    {
        icon: (
            <DockLeftIcon
                size={18}
                color={'currentcolor'}
            />),
        title: 'Sidebar',
    },
    {
        icon: (
            <TuneIcon
                size={18}
                color={'currentcolor'}
            />),
        title: 'Advanced',
    },
];

export const NewUserSettingsModal = (): JSX.Element => {
    const [activeTab, setActiveTab] = useState(sideBarListData[0].title);
    const [somethingChanged, setSomethingChanged] = useState(false);
    const dispatch = useDispatch();
    const [isModalOpen, setIsModalOpen] = useState(true);

    const handleHide = () => {
        dispatch(closeModal(ModalIdentifiers.USER_SETTINGS));
        setIsModalOpen(false);
    };

    const MainSection = () => {
        if (activeTab === sideBarListData[0].title) {
            return (
                <UserSettingsNotifications
                    somethingChanged={somethingChanged}
                    setSomethingChanged={setSomethingChanged}
                />
            );
        } else if (activeTab === sideBarListData[2].title) {
            return (
                <UserSettingsMessagesAndMedia
                    somethingChanged={somethingChanged}
                    setSomethingChanged={setSomethingChanged}
                />
            );
        } else if (activeTab === sideBarListData[3].title) {
            return (
                <LanguageAndRegion
                    somethingChanged={somethingChanged}
                    setSomethingChanged={setSomethingChanged}
                />
            );
        } else if (activeTab === sideBarListData[4].title) {
            return (
                <UserSettingsSidebar
                    somethingChanged={somethingChanged}
                    setSomethingChanged={setSomethingChanged}
                />
            );
        } else if (activeTab === sideBarListData[5].title) {
            return (
                <UserSettingsAdvanced
                    somethingChanged={somethingChanged}
                    setSomethingChanged={setSomethingChanged}
                />
            );
        }
        return <div/>;
    };

    return (
        <>
            <div className='user-settings-modal__header'>
                <h2 className='user-settings-modal__heading'>
                    <FormattedMessage
                        id='global_header.productSettings'
                        defaultMessage='Settings'
                    />
                </h2>
                <div>
                    <div className='inline-block search-preferences'>
                        <span className='pl-3'>
                            <MagnifyIcon
                                size={14.4}
                                color={
                                    'rgba(var(--center-channel-text-rgb), 0.64)'
                                }
                            />
                        </span>
                        <input placeholder='Search preferences'/>
                    </div>
                    <CloseIcon
                        size={24}
                        color={'currentcolor'}
                    />
                </div>
            </div>
            <div className='user-settings-modal__body'>
                <SidebarList
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                />
                <MainSection/>
            </div>
            {somethingChanged && <UnsavedChangesModal/>}
        </>
    );
};
