// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Tooltip} from 'react-bootstrap';
import {FormattedMessage, IntlShape, injectIntl} from 'react-intl';

import {trackEvent} from 'actions/telemetry_actions';

import MenuWrapper from 'components/widgets/menu/menu_wrapper';
import Menu from 'components/widgets/menu/menu';
import OverlayTrigger from 'components/overlay_trigger';

import {AddChannelButtonTreatments} from 'mattermost-redux/constants/config';

import AddChannelTutorialTip from './add_channel_tutorial_tip';

type Props = {
    intl: IntlShape;
    canCreateChannel: boolean;
    canJoinPublicChannel: boolean;
    showMoreChannelsModal: () => void;
    invitePeopleModal: () => void;
    showNewChannelModal: () => void;
    showCreateCategoryModal: () => void;
    handleOpenDirectMessagesModal: (e: Event) => void;
    unreadFilterEnabled: boolean;
    townSquareDisplayName: string;
    offTopicDisplayName: string;
    showTutorialTip: boolean;
    addChannelButton?: AddChannelButtonTreatments;
};

type State = {

};

class AddChannelDropdown extends React.PureComponent<Props, State> {
    getClassModifierForAbTest(): string {
        let modifier = '';
        if (!this.props.addChannelButton) {
            return '';
        }
        switch (this.props.addChannelButton) {
        case AddChannelButtonTreatments.NONE:
            modifier = '';
            break;
        case AddChannelButtonTreatments.BY_TEAM_NAME:
            modifier = 'by-team-name';
            break;
        case AddChannelButtonTreatments.INVERTED_SIDEBAR_BG_COLOR:
            modifier = 'inverted-sidebar-bg-color';
            break;
        default:
            modifier = '';
        }

        return modifier ? ` AddChannelDropdown_dropdownButton--${modifier}` : modifier;
    }

    renderDropdownItems = () => {
        const {intl, canCreateChannel, canJoinPublicChannel} = this.props;

        const invitePeople = (
            <>
                <Menu.ItemAction
                    id='invitePeople'
                    onClick={this.props.invitePeopleModal}
                    icon={<i className='icon-account-plus-outline'/>}
                    text={intl.formatMessage({id: 'sidebar_left.add_channel_dropdown.invitePeople', defaultMessage: 'Invite People'})}
                    extraText={intl.formatMessage({id: 'sidebar_left.add_channel_dropdown.invitePeopleExtraText', defaultMessage: 'Add people to the team'})}
                />
                <li className='MenuGroup menu-divider'/>
            </>
        );

        let joinPublicChannel;
        if (canJoinPublicChannel) {
            joinPublicChannel = (
                <Menu.ItemAction
                    id='showMoreChannels'
                    onClick={this.props.showMoreChannelsModal}
                    icon={<i className='icon-globe'/>}
                    text={intl.formatMessage({id: 'sidebar_left.add_channel_dropdown.browseChannels', defaultMessage: 'Browse Channels'})}
                />
            );
        }

        let createChannel;
        if (canCreateChannel) {
            createChannel = (
                <Menu.ItemAction
                    id='showNewChannel'
                    onClick={this.props.showNewChannelModal}
                    icon={<i className='icon-plus'/>}
                    text={intl.formatMessage({id: 'sidebar_left.add_channel_dropdown.createNewChannel', defaultMessage: 'Create New Channel'})}
                />
            );
        }

        let createCategory;
        if (!this.props.unreadFilterEnabled) {
            createCategory = (
                <Menu.Group>
                    <Menu.ItemAction
                        id='createCategory'
                        onClick={this.props.showCreateCategoryModal}
                        icon={<i className='icon-folder-plus-outline'/>}
                        text={intl.formatMessage({id: 'sidebar_left.add_channel_dropdown.createCategory', defaultMessage: 'Create New Category'})}
                    />
                </Menu.Group>);
        }

        const createDirectMessage = (
            <Menu.ItemAction
                id={'browseDirectMessages'}
                onClick={this.props.handleOpenDirectMessagesModal}
                icon={<i className='icon-account-outline'/>}
                text={intl.formatMessage({id: 'sidebar.openDirectMessage', defaultMessage: 'Open a direct message'})}
            />
        );

        return (
            <>
                <Menu.Group>
                    {invitePeople}
                    {joinPublicChannel}
                    {createChannel}
                    {createDirectMessage}
                </Menu.Group>
                {createCategory}
            </>
        );
    }

    trackOpen(opened: boolean) {
        if (opened) {
            trackEvent('ui', 'ui_add_channel_dropdown_opened');
        }
    }

    render() {
        const {intl, canCreateChannel, canJoinPublicChannel} = this.props;

        if (!(canCreateChannel || canJoinPublicChannel)) {
            return null;
        }

        const tooltip = (
            <Tooltip
                id='new-group-tooltip'
                className='hidden-xs'
            >
                <FormattedMessage
                    id={'sidebar_left.add_channel_dropdown.browseOrCreateChannels'}
                    defaultMessage='Browse or create channels'
                />
            </Tooltip>
        );

        let tutorialTip = null;
        if (this.props.showTutorialTip) {
            tutorialTip = (
                <AddChannelTutorialTip
                    townSquareDisplayName={this.props.townSquareDisplayName}
                    offTopicDisplayName={this.props.offTopicDisplayName}
                />
            );
        }

        return (
            <MenuWrapper
                className='AddChannelDropdown'
                onToggle={this.trackOpen}
            >
                <OverlayTrigger
                    delayShow={500}
                    placement='top'
                    overlay={tooltip}
                >
                    <>
                        <button
                            className={'AddChannelDropdown_dropdownButton' + this.getClassModifierForAbTest()}
                            aria-label={intl.formatMessage({id: 'sidebar_left.add_channel_dropdown.dropdownAriaLabel', defaultMessage: 'Add Channel Dropdown'})}
                        >
                            <i className='icon-plus'/>
                        </button>
                        {tutorialTip}
                    </>
                </OverlayTrigger>
                <Menu
                    id='AddChannelDropdown'
                    ariaLabel={intl.formatMessage({id: 'sidebar_left.add_channel_dropdown.dropdownAriaLabel', defaultMessage: 'Add Channel Dropdown'})}
                >
                    {this.renderDropdownItems()}
                </Menu>
            </MenuWrapper>
        );
    }
}

export default injectIntl(AddChannelDropdown);
