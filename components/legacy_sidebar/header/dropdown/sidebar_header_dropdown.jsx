// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import * as GlobalActions from 'actions/global_actions';
import {Constants, ModalIdentifiers} from 'utils/constants';
import {cmdOrCtrlPressed, isKeyPressed} from 'utils/utils';

import SidebarHeaderDropdownButton from '../sidebar_header_dropdown_button.jsx';

import UserSettingsModal from 'components/user_settings/modal';

import MenuWrapper from 'components/widgets/menu/menu_wrapper';

import MainMenu from 'components/main_menu';

import {isAdmin} from 'utils/utils.jsx';

export default class SidebarHeaderDropdown extends React.PureComponent {
    static propTypes = {
        teamDescription: PropTypes.string.isRequired,
        teamDisplayName: PropTypes.string.isRequired,
        teamId: PropTypes.string.isRequired,
        currentUser: PropTypes.object,
        showTutorialTip: PropTypes.bool.isRequired,
        enablePluginMarketplace: PropTypes.bool.isRequired,
        firstAdminVisitMarketplaceStatus: PropTypes.bool.isRequired,
        actions: PropTypes.shape({
            openModal: PropTypes.func.isRequired,
            getFirstAdminVisitMarketplaceStatus: PropTypes.func.isRequired,
        }).isRequired,
        globalHeaderEnabled: PropTypes.bool,
    };

    static defaultProps = {
        teamType: '',
        pluginMenuItems: [],
    };

    toggleShortcutsModal = (e) => {
        e.preventDefault();
        GlobalActions.toggleShortcutsModal();
    }

    componentDidMount() {
        document.addEventListener('keydown', this.handleKeyDown);
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this.handleKeyDown);
    }

    handleKeyDown = (e) => {
        if (cmdOrCtrlPressed(e) && e.shiftKey && isKeyPressed(e, Constants.KeyCodes.A)) {
            e.preventDefault();
            this.props.actions.openModal({ModalId: ModalIdentifiers.USER_SETTINGS, dialogType: UserSettingsModal});
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
                    getFirstAdminVisitMarketplaceStatus={this.props.actions.getFirstAdminVisitMarketplaceStatus}
                    showUnread={this.props.enablePluginMarketplace && isAdmin(this.props.currentUser.roles) && !this.props.firstAdminVisitMarketplaceStatus}
                    globalHeaderEnabled={this.props.globalHeaderEnabled}
                />
                <MainMenu id='sidebarDropdownMenu'/>
            </MenuWrapper>
        );
    }
}
