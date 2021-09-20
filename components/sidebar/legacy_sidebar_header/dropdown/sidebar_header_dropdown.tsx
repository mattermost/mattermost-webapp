// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {UserProfile} from 'mattermost-redux/types/users';

import * as GlobalActions from 'actions/global_actions';
import {Constants, ModalIdentifiers} from 'utils/constants';
import {cmdOrCtrlPressed, isKeyPressed} from 'utils/utils';

import UserSettingsModal from 'components/user_settings/modal';
import MenuWrapper from 'components/widgets/menu/menu_wrapper';
import MainMenu from 'components/main_menu';

import SidebarHeaderDropdownButton from './sidebar_header_dropdown_button';

type Actions = {
    openModal: (openModalData: any) => void;
}

type Props = {
    teamDescription: string;
    teamDisplayName: string;
    teamId: string;
    currentUser: UserProfile;
    showTutorialTip: boolean;
    actions: Actions;
}

export default class SidebarHeaderDropdown extends React.PureComponent<Props> {
    toggleShortcutsModal = (e: React.MouseEvent) => {
        e.preventDefault();
        GlobalActions.toggleShortcutsModal();
    }

    componentDidMount() {
        document.addEventListener('keydown', this.handleKeyDown);
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this.handleKeyDown);
    }

    handleKeyDown = (e: KeyboardEvent) => {
        if (cmdOrCtrlPressed(e) && e.shiftKey && isKeyPressed(e, Constants.KeyCodes.A)) {
            e.preventDefault();
            this.props.actions.openModal({modalId: ModalIdentifiers.USER_SETTINGS, dialogType: UserSettingsModal, dialogProps: {isContentProductSettings: true}});
        }
    }

    handleEmitUserLoggedOutEvent = () => {
        GlobalActions.emitUserLoggedOutEvent();
    }

    render() {
        const currentUser = this.props.currentUser;

        if (!currentUser) {
            return null;
        }

        return (
            <MenuWrapper
                className='main-menu'
            >
                <SidebarHeaderDropdownButton
                    showTutorialTip={this.props.showTutorialTip}
                    teamDescription={this.props.teamDescription}
                    currentUser={this.props.currentUser}
                    teamDisplayName={this.props.teamDisplayName}
                    teamId={this.props.teamId}
                    openModal={this.props.actions.openModal}
                />
                <MainMenu id='sidebarDropdownMenu'/>
            </MenuWrapper>
        );
    }
}
