// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {UserProfile} from '@mattermost/types/users';

import UserSettingsNotifications from '../new_user_settings/notifications/user_settings_notifications';

import LanguageAndRegion from '../new_user_settings/language&region/language&region';

import UserSettingsMessagesAndMedia from '../new_user_settings/messages&media/user_settings_messages&media';

import UserSettingsSidebar from '../new_user_settings/user_settings_sidebar/user_settings_sidebar';

import AdvancedTab from './advanced';
import GeneralTab from './general';
import SecurityTab from './security';

import UserSettingsThemes from './themes';
import CtrlSendSection from './advanced/ctrl_send_section';

export type Props = {
    user: UserProfile;
    activeTab?: string;
    activeSection: string;
    updateSection: (section?: string) => void;
    updateTab: (notifications: string) => void;
    closeModal: () => void;
    collapseModal: () => void;
    setEnforceFocus: () => void;
    setRequireConfirm: () => void;
};

export default class UserSettings extends React.PureComponent<Props> {
    render() {
        if (this.props.activeTab === 'profile') {
            return (
                <div>
                    <GeneralTab
                        user={this.props.user}
                        activeSection={this.props.activeSection}
                        updateSection={this.props.updateSection}
                        updateTab={this.props.updateTab}
                        closeModal={this.props.closeModal}
                        collapseModal={this.props.collapseModal}
                    />
                </div>
            );
        } else if (this.props.activeTab === 'security') {
            return (
                <div>
                    <SecurityTab
                        user={this.props.user}
                        activeSection={this.props.activeSection}
                        updateSection={this.props.updateSection}
                        closeModal={this.props.closeModal}
                        collapseModal={this.props.collapseModal}
                        setRequireConfirm={this.props.setRequireConfirm}
                    />
                </div>
            );
        } else if (this.props.activeTab === 'notifications') {
            return (
                <div>
                    <UserSettingsNotifications/>
                    {/*<NotificationsTab*/}
                    {/*    user={this.props.user}*/}
                    {/*    activeSection={this.props.activeSection}*/}
                    {/*    updateSection={this.props.updateSection}*/}
                    {/*    closeModal={this.props.closeModal}*/}
                    {/*    collapseModal={this.props.collapseModal}*/}
                    {/*/>*/}
                </div>
            );
        } else if (this.props.activeTab === 'language') {
            return (
                <div>
                    <LanguageAndRegion/>
                </div>
            );
        } else if (this.props.activeTab === 'messages') {
            return (
                <div>
                    <UserSettingsMessagesAndMedia/>
                </div>
            );
        } else if (this.props.activeTab === 'messages') {
            return (
                <div>
                    <UserSettingsMessagesAndMedia/>
                </div>
            );
        } else if (this.props.activeTab === 'themes') {
            return (
                <div>
                    {/*<DisplayTab*/}
                    {/*    user={this.props.user}*/}
                    {/*    activeSection={this.props.activeSection}*/}
                    {/*    updateSection={this.props.updateSection}*/}
                    {/*    closeModal={this.props.closeModal}*/}
                    {/*    collapseModal={this.props.collapseModal}*/}
                    {/*    setEnforceFocus={this.props.setEnforceFocus}*/}
                    {/*    setRequireConfirm={this.props.setRequireConfirm}*/}
                    {/*/>*/}
                    <UserSettingsThemes/>
                </div>
            );
        } else if (this.props.activeTab === 'sidebar') {
            return (
                <div>
                    {/*<SidebarTab*/}
                    {/*    activeSection={this.props.activeSection}*/}
                    {/*    updateSection={this.props.updateSection}*/}
                    {/*    closeModal={this.props.closeModal}*/}
                    {/*    collapseModal={this.props.collapseModal}*/}
                    {/*/>*/}
                    <UserSettingsSidebar/>
                </div>
            );
        } else if (this.props.activeTab === 'advanced') {
            return (
                <AdvancedTab
                    activeSection={this.props.activeSection}
                    updateSection={this.props.updateSection}
                    closeModal={this.props.closeModal}
                    collapseModal={this.props.collapseModal}
                />
            );
        }

        return <div/>;
    }
}
