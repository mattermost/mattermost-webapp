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
import InviteMembersButton from '../invite_members_button';
import {InviteMembersBtnLocations, AddChannelButtonTreatments} from 'mattermost-redux/constants/config';

export type Props = {
    addChannelButton?: AddChannelButtonTreatments;
    canGoForward: boolean;
    canGoBack: boolean;
    canJoinPublicChannel: boolean;
    showMoreChannelsModal: () => void;
    invitePeopleModal: () => void;
    showNewChannelModal: () => void;
    showCreateCategoryModal: () => void;
    handleOpenDirectMessagesModal: (e: Event) => void;
    unreadFilterEnabled: boolean;
    canCreateChannel: boolean;
    showUnreadsCategory: boolean;
    townSquareDisplayName: string;
    offTopicDisplayName: string;
    showTutorialTip: boolean;
    globalHeaderEnabled: boolean;
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
                    {`${Utils.isMac() ? '⌘' : 'Ctrl+'}K`}
                </div>
            </button>
        );

        let addChannelDropdown = null;
        if (!this.props.addChannelButton || this.props.addChannelButton === AddChannelButtonTreatments.NONE) {
            addChannelDropdown = (
                <AddChannelDropdown
                    showNewChannelModal={this.props.showNewChannelModal}
                    showMoreChannelsModal={this.props.showMoreChannelsModal}
                    invitePeopleModal={this.props.invitePeopleModal}
                    showCreateCategoryModal={this.props.showCreateCategoryModal}
                    canCreateChannel={this.props.canCreateChannel}
                    canJoinPublicChannel={this.props.canJoinPublicChannel}
                    handleOpenDirectMessagesModal={this.props.handleOpenDirectMessagesModal}
                    unreadFilterEnabled={this.props.unreadFilterEnabled}
                    townSquareDisplayName={this.props.townSquareDisplayName}
                    offTopicDisplayName={this.props.offTopicDisplayName}
                    showTutorialTip={this.props.showTutorialTip}
                    addChannelButton={this.props.addChannelButton}
                />
            );
        }

        const inviteMembersUserIcon = (<InviteMembersButton buttonType={InviteMembersBtnLocations.USER_ICON}/>);

        let layout;
        if (isDesktopApp() && !this.props.globalHeaderEnabled) {
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
                            {!this.props.globalHeaderEnabled && historyArrows}
                        </div>
                        {inviteMembersUserIcon}
                        {addChannelDropdown}
                    </div>
                </div>
            );
        } else {
            layout = (
                <div className={'SidebarChannelNavigator webapp'}>
                    {!this.props.showUnreadsCategory && <ChannelFilter/>}
                    {jumpToButton}
                    {inviteMembersUserIcon}
                    {addChannelDropdown}
                </div>
            );
        }

        return layout;
    }

    // TODO: the render function in place can be replaced with this one, once we successfully release v6.0
    // render() {
    //     let addChannelDropdown = null;
    //     if (!this.props.addChannelButton || this.props.addChannelButton === AddChannelButtonTreatments.NONE) (
    //         <AddChannelDropdown
    //             showNewChannelModal={this.props.showNewChannelModal}
    //             showMoreChannelsModal={this.props.showMoreChannelsModal}
    //             invitePeopleModal={this.props.invitePeopleModal}
    //             showCreateCategoryModal={this.props.showCreateCategoryModal}
    //             canCreateChannel={this.props.canCreateChannel}
    //             canJoinPublicChannel={this.props.canJoinPublicChannel}
    //             handleOpenDirectMessagesModal={this.props.handleOpenDirectMessagesModal}
    //             unreadFilterEnabled={this.props.unreadFilterEnabled}
    //             townSquareDisplayName={this.props.townSquareDisplayName}
    //             offTopicDisplayName={this.props.offTopicDisplayName}
    //             showTutorialTip={this.props.showTutorialTip}
    //             addChannelButton={this.props.addChannelButton}
    //         />
    //     );
    //
    //     return (
    //         <div className={'SidebarChannelNavigator webapp'}>
    //             {!this.props.showUnreadsCategory && <ChannelFilter/>}
    //             <button
    //                 className={'SidebarChannelNavigator_jumpToButton'}
    //                 onClick={this.openQuickSwitcher}
    //                 aria-label={Utils.localizeMessage('sidebar_left.channel_navigator.channelSwitcherLabel', 'Channel Switcher')}
    //             >
    //                 <i className='icon icon-magnify'/>
    //                 <FormattedMessage
    //                     id='sidebar_left.channel_navigator.jumpTo'
    //                     defaultMessage='Find channel'
    //                 />
    //                 <div className={'SidebarChannelNavigator_shortcutText'}>
    //                     {`${Utils.isMac() ? '⌘' : 'Ctrl+'}K`}
    //                 </div>
    //             </button>
    //             <InviteMembersButton buttonType={InviteMembersBtnLocations.USER_ICON}/>
    //             {addChannelDropdown}
    //         </div>
    //     );
    // }
}
