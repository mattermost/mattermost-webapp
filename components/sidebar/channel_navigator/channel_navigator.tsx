// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {MouseEvent} from 'react';
import {FormattedMessage} from 'react-intl';

import {trackEvent} from 'actions/telemetry_actions';

import {ModalData} from 'types/actions';

import QuickSwitchModal from 'components/quick_switch_modal';
import CommandPaletteModal from 'components/command_palette/command_palette_modal/command_palette_modal';
import {CommandPaletteEntities} from 'components/command_palette/types';

import Constants, {ModalIdentifiers} from 'utils/constants';
import * as Utils from 'utils/utils';

import ChannelFilter from '../channel_filter';

export type Props = {
    canGoForward: boolean;
    canGoBack: boolean;
    canJoinPublicChannel: boolean;
    showMoreChannelsModal: () => void;
    showCreateUserGroupModal: () => void;
    invitePeopleModal: () => void;
    showNewChannelModal: () => void;
    showCreateCategoryModal: () => void;
    handleOpenDirectMessagesModal: (e: Event) => void;
    unreadFilterEnabled: boolean;
    canCreateChannel: boolean;
    showUnreadsCategory: boolean;
    isQuickSwitcherOpen: boolean;
    userGroupsEnabled: boolean;
    canCreateCustomGroups: boolean;
    isCommandPaletteEnabled: boolean;
    actions: {
        openModal: <P>(modalData: ModalData<P>) => void;
        closeModal: (modalId: string) => void;
        goBack: () => void;
        goForward: () => void;
    };
};

export default class ChannelNavigator extends React.PureComponent<Props> {
    componentDidMount() {
        document.addEventListener('keydown', this.handleShortcut);

        if (!this.props.isCommandPaletteEnabled) {
            document.addEventListener('keydown', this.handleQuickSwitchKeyPress);
        }
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this.handleShortcut);

        if (!this.props.isCommandPaletteEnabled) {
            document.removeEventListener('keydown', this.handleQuickSwitchKeyPress);
        }
    }

    handleFindChannelClick = (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();

        if (this.props.isCommandPaletteEnabled) {
            this.props.actions.openModal({
                modalId: ModalIdentifiers.COMMAND_PALETTE,
                dialogType: CommandPaletteModal,
                dialogProps: {
                    selectedEntities: [CommandPaletteEntities.Channel],
                },
            });
        } else {
            this.props.actions.openModal({
                modalId: ModalIdentifiers.QUICK_SWITCH,
                dialogType: QuickSwitchModal,
            });
            trackEvent('ui', 'ui_sidebar_open_channel_switcher_v2');
        }
    }

    handleShortcut = (e: KeyboardEvent) => {
        const {actions: {closeModal}} = this.props;

        if (Utils.cmdOrCtrlPressed(e) && e.shiftKey) {
            if (Utils.isKeyPressed(e, Constants.KeyCodes.M)) {
                e.preventDefault();
                closeModal(ModalIdentifiers.QUICK_SWITCH);
            }
            if (Utils.isKeyPressed(e, Constants.KeyCodes.L)) {
                // just close the modal if it's open, but let someone else handle the shortcut
                closeModal(ModalIdentifiers.QUICK_SWITCH);
            }
        }
    };

    handleQuickSwitchKeyPress = (e: KeyboardEvent) => {
        if (Utils.cmdOrCtrlPressed(e) && !e.shiftKey && Utils.isKeyPressed(e, Constants.KeyCodes.K)) {
            if (!e.altKey) {
                e.preventDefault();
                this.toggleQuickSwitchModal();
            }
        }
    }

    toggleQuickSwitchModal = () => {
        const {isQuickSwitcherOpen, actions: {openModal, closeModal}} = this.props;

        if (isQuickSwitcherOpen) {
            closeModal(ModalIdentifiers.QUICK_SWITCH);
        } else {
            openModal({
                modalId: ModalIdentifiers.QUICK_SWITCH,
                dialogType: QuickSwitchModal,
            });
        }
    }

    goBack = () => {
        trackEvent('ui', 'ui_history_back');
        this.props.actions.goBack();
    }

    goForward = () => {
        trackEvent('ui', 'ui_history_forward');
        this.props.actions.goForward();
    }

    render() {
        return (
            <div className={'SidebarChannelNavigator webapp'}>
                {!this.props.showUnreadsCategory && <ChannelFilter/>}
                <button
                    className={'SidebarChannelNavigator_jumpToButton'}
                    onClick={this.handleFindChannelClick}
                    aria-label={Utils.localizeMessage('sidebar_left.channel_navigator.channelSwitcherLabel', 'Channel Switcher')}
                >
                    <i className='icon icon-magnify'/>
                    <FormattedMessage
                        id='sidebar_left.channel_navigator.jumpTo'
                        defaultMessage='Find channel'
                    />
                    <div className={'SidebarChannelNavigator_shortcutText'}>
                        {`${Utils.isMac() ? '⌘' : 'Ctrl+'}K`}
                    </div>
                </button>
            </div>
        );
    }
}
