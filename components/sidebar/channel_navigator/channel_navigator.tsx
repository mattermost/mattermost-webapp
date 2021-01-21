// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';
import classNames from 'classnames';

import {trackEvent} from 'actions/telemetry_actions';
import {ModalIdentifiers} from 'utils/constants';
import QuickSwitchModal from 'components/quick_switch_modal';
import * as Utils from 'utils/utils';
import {isDesktopApp} from 'utils/user_agent';
import AddChannelDropdown from '../add_channel_dropdown';
import ChannelFilter from '../channel_filter';

type Props = {
    canGoForward: boolean;
    canGoBack: boolean;
    canJoinPublicChannel: boolean;
    showMoreChannelsModal: () => void;
    showNewChannelModal: () => void;
    showCreateCategoryModal: () => void;
    handleOpenDirectMessagesModal: (e: Event) => void;
    unreadFilterEnabled: boolean;
    canCreateChannel: boolean;
    showUnreadsCategory: boolean;
    actions: {
        openModal: (modalData: any) => Promise<{data: boolean}>;
        goBack: () => void;
        goForward: () => void;
    };
};

export default class ChannelNavigator extends React.PureComponent<Props> {
    openQuickSwitcher = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();

        trackEvent('ui', 'ui_sidebar_open_channel_switcher_v2');

        this.props.actions.openModal({
            modalId: ModalIdentifiers.QUICK_SWITCH,
            dialogType: QuickSwitchModal,
        });
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
        let channelSwitchTextShortcutDefault = 'Ctrl+K';
        if (Utils.isMac()) {
            channelSwitchTextShortcutDefault = '⌘K';
        }

        const jumpToButton = (
            <button
                className={'SidebarChannelNavigator_jumpToButton'}
                onClick={this.openQuickSwitcher}
                aria-label={Utils.localizeMessage('sidebar_left.channel_navigator.channelSwitcherLabel', 'Channel Switcher')}
            >
                <i className='icon icon-magnify'/>
                <FormattedMessage
                    id='sidebar_left.channel_navigator.jumpTo'
                    defaultMessage='Find channel'
                />
                <div className={'SidebarChannelNavigator_shortcutText'}>
                    {channelSwitchTextShortcutDefault}
                </div>
            </button>
        );

        const addChannelDropdown = (
            <AddChannelDropdown
                showNewChannelModal={this.props.showNewChannelModal}
                showMoreChannelsModal={this.props.showMoreChannelsModal}
                showCreateCategoryModal={this.props.showCreateCategoryModal}
                canCreateChannel={this.props.canCreateChannel}
                canJoinPublicChannel={this.props.canJoinPublicChannel}
                handleOpenDirectMessagesModal={this.props.handleOpenDirectMessagesModal}
                unreadFilterEnabled={this.props.unreadFilterEnabled}
            />
        );

        let layout;
        if (isDesktopApp()) {
            const historyArrows = (
                <>
                    <button
                        className={classNames('SidebarChannelNavigator_backButton', {disabled: !this.props.canGoBack})}
                        disabled={!this.props.canGoBack}
                        onClick={this.goBack}
                        aria-label={Utils.localizeMessage('sidebar_left.channel_navigator.goBackLabel', 'Back')}
                    >
                        <i className='icon icon-arrow-left'/>
                    </button>
                    <button
                        className={classNames('SidebarChannelNavigator_forwardButton', {disabled: !this.props.canGoForward})}
                        disabled={!this.props.canGoForward}
                        onClick={this.goForward}
                        aria-label={Utils.localizeMessage('sidebar_left.channel_navigator.goForwardLabel', 'Forward')}
                    >
                        <i className='icon icon-arrow-right'/>
                    </button>
                </>
            );

            layout = (
                <div className={'SidebarChannelNavigator desktop'}>
                    {jumpToButton}
                    <div className='SidebarContainer_filterAddChannel desktop'>
                        <div className='SidebarContainer_rightContainer'>
                            {!this.props.showUnreadsCategory && <ChannelFilter/>}
                            {!this.props.showUnreadsCategory && <div className='SidebarChannelNavigator_divider'/>}
                            {historyArrows}
                        </div>
                        {addChannelDropdown}
                    </div>
                </div>
            );
        } else {
            layout = (
                <div className={'SidebarChannelNavigator webapp'}>
                    {!this.props.showUnreadsCategory && <ChannelFilter/>}
                    {jumpToButton}
                    {addChannelDropdown}
                </div>
            );
        }

        return layout;
    }
}
