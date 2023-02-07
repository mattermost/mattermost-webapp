// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage, injectIntl, WrappedComponentProps} from 'react-intl';
import {HelpCircleOutlineIcon} from '@mattermost/compass-icons/components';

import {trackEvent} from 'actions/telemetry_actions';

import {ModalIdentifiers} from 'utils/constants';

import MenuWrapper from 'components/widgets/menu/menu_wrapper';
import Menu from 'components/widgets/menu/menu';
import OverlayTrigger from 'components/overlay_trigger';
import Tooltip from 'components/tooltip';
import KeyboardShortcutsModal from 'components/keyboard_shortcuts/keyboard_shortcuts_modal/keyboard_shortcuts_modal';

import {IconButton} from '@mattermost/compass-ui';

import type {PropsFromRedux} from './index';

const askTheCommunityUrl = 'https://mattermost.com/pl/default-ask-mattermost-community/';

type Props = WrappedComponentProps & PropsFromRedux & {
    location: {
        pathname: string;
    };
}

type State = {
    buttonActive: boolean;
};

class UserGuideDropdown extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            buttonActive: false,
        };
    }

    openKeyboardShortcutsModal = (e: MouseEvent) => {
        e.preventDefault();
        this.props.actions.openModal({
            modalId: ModalIdentifiers.KEYBOARD_SHORTCUTS_MODAL,
            dialogType: KeyboardShortcutsModal,
        });
    }

    buttonToggleState = (menuActive: boolean) => {
        this.setState({
            buttonActive: menuActive,
        });
    }

    askTheCommunityClick = () => {
        trackEvent('ui', 'help_ask_the_community');
    }

    renderDropdownItems = (): React.ReactNode => {
        const {
            intl,
            pluginMenuItems,
        } = this.props;

        const pluginItems = pluginMenuItems?.map((item) => {
            return (
                <Menu.ItemAction
                    id={item.id + '_pluginmenuitem'}
                    key={item.id + '_pluginmenuitem'}
                    onClick={item.action}
                    text={item.text}
                />
            );
        });

        return (
            <Menu.Group>
                {this.props.enableAskCommunityLink === 'true' && (
                    <Menu.ItemExternalLink
                        id='askTheCommunityLink'
                        url={askTheCommunityUrl}
                        text={intl.formatMessage({id: 'userGuideHelp.askTheCommunity', defaultMessage: 'Ask the community'})}
                        onClick={this.askTheCommunityClick}
                    />
                )}
                <Menu.ItemExternalLink
                    id='helpResourcesLink'
                    url={this.props.helpLink}
                    text={intl.formatMessage({id: 'userGuideHelp.helpResources', defaultMessage: 'Help resources'})}
                />
                {this.props.reportAProblemLink && (
                    <Menu.ItemExternalLink
                        id='reportAProblemLink'
                        url={this.props.reportAProblemLink}
                        text={intl.formatMessage({id: 'userGuideHelp.reportAProblem', defaultMessage: 'Report a problem'})}
                    />
                )}
                <Menu.ItemAction
                    id='keyboardShortcuts'
                    onClick={this.openKeyboardShortcutsModal}
                    text={intl.formatMessage({id: 'userGuideHelp.keyboardShortcuts', defaultMessage: 'Keyboard shortcuts'})}
                />
                {pluginItems}
            </Menu.Group>
        );
    }

    render() {
        const {intl} = this.props;
        const tooltip = (
            <Tooltip
                id='userGuideHelpTooltip'
                className='hidden-xs'
            >
                <FormattedMessage
                    id={'channel_header.userHelpGuide'}
                    defaultMessage='Help'
                />
            </Tooltip>
        );

        return (
            <MenuWrapper
                id='helpMenuPortal'
                className='userGuideHelp'
                onToggle={this.buttonToggleState}
            >
                <OverlayTrigger
                    delayShow={500}
                    placement='bottom'
                    overlay={this.state.buttonActive ? <></> : tooltip}
                >
                    <IconButton
                        size={'small'}
                        IconComponent={HelpCircleOutlineIcon}
                        toggled={this.state.buttonActive}
                        compact={true}
                        aria-controls='AddChannelDropdown'
                        aria-expanded={this.state.buttonActive}
                        aria-label={intl.formatMessage({id: 'channel_header.userHelpGuide', defaultMessage: 'Help'})}
                    />
                </OverlayTrigger>
                <Menu
                    openLeft={true}
                    openUp={false}
                    id='AddChannelDropdown'
                    ariaLabel={intl.formatMessage({id: 'sidebar_left.add_channel_dropdown.dropdownAriaLabel', defaultMessage: 'Add Channel Dropdown'})}
                >
                    {this.renderDropdownItems()}
                </Menu>
            </MenuWrapper>
        );
    }
}

export default injectIntl(UserGuideDropdown);
