// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';

import {Tooltip} from 'react-bootstrap';

import Constants, {UserStatuses, ModalIdentifiers} from 'utils/constants';
import {localizeMessage} from 'utils/utils.jsx';
import ResetStatusModal from 'components/reset_status_modal';
import StatusIcon from 'components/status_icon';

import Avatar from 'components/widgets/users/avatar';
import CustomStatusModal from 'components/custom_status/custom_status_modal';
import EmojiIcon from 'components/widgets/icons/emoji_icon';
import CustomStatusEmoji from 'components/custom_status/custom_status_emoji';
import Menu from 'components/widgets/menu/menu';
import MenuWrapper from 'components/widgets/menu/menu_wrapper';
import StatusAwayIcon from 'components/widgets/icons/status_away_icon';
import StatusOnlineIcon from 'components/widgets/icons/status_online_icon';
import StatusDndIcon from 'components/widgets/icons/status_dnd_icon';
import StatusOfflineIcon from 'components/widgets/icons/status_offline_icon';

import OverlayTrigger from 'components/overlay_trigger';
import './status_dropdown.scss';

export default class StatusDropdown extends React.PureComponent {
    static propTypes = {
        style: PropTypes.object,
        status: PropTypes.string,
        userId: PropTypes.string.isRequired,
        profilePicture: PropTypes.string,
        autoResetPref: PropTypes.string,
        actions: PropTypes.shape({
            openModal: PropTypes.func.isRequired,
            setStatus: PropTypes.func.isRequired,
            unsetUserCustomStatus: PropTypes.func.isRequired,
            setStatusDropdown: PropTypes.func.isRequired,
            setCustomStatusInitialProps: PropTypes.func.isRequired,
        }).isRequired,
        customStatus: PropTypes.object,
        isCustomStatusEnabled: PropTypes.bool.isRequired,
        isStatusDropdownOpen: PropTypes.bool.isRequired,
        showPulsatingDot: PropTypes.bool.isRequired,
    }

    static defaultProps = {
        userId: '',
        profilePicture: '',
        status: UserStatuses.OFFLINE,
        customStatus: {},
    }

    constructor(props) {
        super(props);
        this.customStatusTextRef = React.createRef();
    }

    state = {
        showCustomStatusTooltip: false,
    }

    isUserOutOfOffice = () => {
        return this.props.status === UserStatuses.OUT_OF_OFFICE;
    }

    setStatus = (status) => {
        this.props.actions.setStatus({
            user_id: this.props.userId,
            status,
        });
    }

    setOnline = (event) => {
        event.preventDefault();
        this.setStatus(UserStatuses.ONLINE);
    }

    setOffline = (event) => {
        event.preventDefault();
        this.setStatus(UserStatuses.OFFLINE);
    }

    setAway = (event) => {
        event.preventDefault();
        this.setStatus(UserStatuses.AWAY);
    }

    setDnd = (event) => {
        event.preventDefault();
        this.setStatus(UserStatuses.DND);
    }

    showStatusChangeConfirmation = (status) => {
        const resetStatusModalData = {
            ModalId: ModalIdentifiers.RESET_STATUS,
            dialogType: ResetStatusModal,
            dialogProps: {newStatus: status},
        };

        this.props.actions.openModal(resetStatusModalData);
    };

    showCustomStatusModal = () => {
        const customStatusInputModalData = {
            ModalId: ModalIdentifiers.CUSTOM_STATUS,
            dialogType: CustomStatusModal,
            dialogProps: {userId: this.props.userId},
        };

        this.props.actions.openModal(customStatusInputModalData);
    }

    showCustomStatusTextTooltip = () => {
        const element = this.customStatusTextRef.current;
        if (element && element.offsetWidth < element.scrollWidth) {
            this.setState({showCustomStatusTooltip: true});
        } else {
            this.setState({showCustomStatusTooltip: false});
        }
    }

    renderProfilePicture = () => {
        if (!this.props.profilePicture) {
            return null;
        }
        return (
            <Avatar
                size='lg'
                url={this.props.profilePicture}
            />
        );
    }

    renderDropdownIcon = () => {
        return (
            <FormattedMessage
                id='generic_icons.dropdown'
                defaultMessage='Dropdown Icon'
            >
                { (title) => (
                    <i
                        className={'fa fa-caret-down'}
                        aria-label={title}
                    />)
                }
            </FormattedMessage>
        );
    }
    handleClearStatus = (e) => {
        e.stopPropagation();
        this.props.actions.unsetUserCustomStatus();
    };

    onToggle = (open) => {
        if (open) {
            this.showCustomStatusTextTooltip();
            this.props.actions.setCustomStatusInitialProps({menuOpenedOnClick: Constants.CustomStatusInitialProps.MENU_OPENED_BY_SIDEBAR_HEADER});
        }
        this.props.actions.setStatusDropdown(open);
    }

    render() {
        const needsConfirm = this.isUserOutOfOffice() && this.props.autoResetPref === '';
        const profilePicture = this.renderProfilePicture();
        const dropdownIcon = this.renderDropdownIcon();

        const setOnline = needsConfirm ? () => this.showStatusChangeConfirmation('online') : this.setOnline;
        const setDnd = needsConfirm ? () => this.showStatusChangeConfirmation('dnd') : this.setDnd;
        const setAway = needsConfirm ? () => this.showStatusChangeConfirmation('away') : this.setAway;
        const setOffline = needsConfirm ? () => this.showStatusChangeConfirmation('offline') : this.setOffline;

        let customStatusComponent;
        if (this.props.isCustomStatusEnabled) {
            let customStatusText = localizeMessage('status_dropdown.set_custom', 'Set a Custom Status');
            let customStatusEmoji = <EmojiIcon className={'custom-status-emoji'}/>;
            const customStatus = this.props.customStatus;
            const isStatusSet = customStatus && (customStatus.text || customStatus.emoji);
            if (isStatusSet) {
                customStatusEmoji = (
                    <span className='d-flex'>
                        <CustomStatusEmoji
                            showTooltip={false}
                        />
                    </span>
                );
                customStatusText = customStatus.text;
            }

            let customStatusTextComponent = (
                <span
                    className='custom_status__text'
                    ref={this.customStatusTextRef}
                >
                    {customStatusText}
                </span>
            );

            if (isStatusSet && this.state.showCustomStatusTooltip) {
                customStatusTextComponent = (
                    <OverlayTrigger
                        delayShow={Constants.OVERLAY_TIME_DELAY}
                        placement='bottom'
                        overlay={
                            <Tooltip id='custom-status-text-tooltip'>
                                {customStatusText}
                            </Tooltip>
                        }
                    >
                        {customStatusTextComponent}
                    </OverlayTrigger>
                );
            }

            const clearButton = isStatusSet &&
                (
                    <div
                        className='custom_status__clear'
                    >
                        <OverlayTrigger
                            delayShow={Constants.OVERLAY_TIME_DELAY}
                            placement='top'
                            overlay={
                                <Tooltip id='clear-custom-status'>
                                    <FormattedMessage
                                        id='status_dropdown.custom_status.tooltip_clear'
                                        defaultMessage='Clear'
                                    />
                                </Tooltip>
                            }
                        >
                            <span
                                className='input-clear-x'
                                onClick={this.handleClearStatus}
                            >
                                <i className='icon icon-close-circle'/>
                            </span>
                        </OverlayTrigger>
                    </div>
                );

            const pulsatingDot = !isStatusSet && this.props.showPulsatingDot && (
                <div className='pulsating_dot'/>
            );

            customStatusComponent = (
                <div
                    className='custom_status__row cursor--pointer a11y--active'
                    onClick={this.showCustomStatusModal}
                >
                    <div className='custom_status__icon'>
                        {customStatusEmoji}
                    </div>
                    {customStatusTextComponent}
                    {clearButton || pulsatingDot}
                </div>
            );
        }

        return (
            <MenuWrapper
                onToggle={this.onToggle}
                style={this.props.style}
                open={this.props.isStatusDropdownOpen}
                className={'status-dropdown-menu'}
            >
                <div className='status-wrapper status-selector'>
                    {profilePicture}
                    <button
                        className='status style--none'
                        aria-label={localizeMessage('status_dropdown.menuAriaLabel', 'Set a status')}
                    >
                        <StatusIcon
                            status={this.props.status}
                            button={true}
                        />
                    </button>
                    <span className={'status status-edit edit'}>
                        {dropdownIcon}
                    </span>
                </div>
                <Menu
                    ariaLabel={localizeMessage('status_dropdown.menuAriaLabel', 'Set a status')}
                    id='statusDropdownMenu'
                >
                    {!this.props.isCustomStatusEnabled && (
                        <Menu.Header>
                            <FormattedMessage
                                id='status_dropdown.set_your_status'
                                defaultMessage='Status'
                            />
                        </Menu.Header>
                    )}
                    <Menu.Group>
                        <Menu.ItemAction
                            show={this.isUserOutOfOffice()}
                            onClick={() => null}
                            ariaLabel={localizeMessage('status_dropdown.set_ooo', 'Out of office').toLowerCase()}
                            text={localizeMessage('status_dropdown.set_ooo', 'Out of office')}
                            extraText={localizeMessage('status_dropdown.set_ooo.extra', 'Automatic Replies are enabled')}
                        />
                    </Menu.Group>
                    {customStatusComponent}
                    <Menu.Group>
                        <Menu.ItemAction
                            onClick={setOnline}
                            ariaLabel={localizeMessage('status_dropdown.set_online', 'Online').toLowerCase()}
                            text={localizeMessage('status_dropdown.set_online', 'Online')}
                            icon={<StatusOnlineIcon className={'online--icon'}/>}
                            id={'status-menu-online'}
                        />
                        <Menu.ItemAction
                            onClick={setAway}
                            ariaLabel={localizeMessage('status_dropdown.set_away', 'Away').toLowerCase()}
                            text={localizeMessage('status_dropdown.set_away', 'Away')}
                            icon={<StatusAwayIcon className={'away--icon'}/>}
                            id={'status-menu-away'}
                        />
                        <Menu.ItemAction
                            onClick={setDnd}
                            ariaLabel={`${localizeMessage('status_dropdown.set_dnd', 'Do not disturb').toLowerCase()}. ${localizeMessage('status_dropdown.set_dnd.extra', 'Disables desktop, email and push notifications').toLowerCase()}`}
                            text={localizeMessage('status_dropdown.set_dnd', 'Do not disturb')}
                            extraText={localizeMessage('status_dropdown.set_dnd.extra', 'Disables all notifications')}
                            icon={<StatusDndIcon className={'dnd--icon'}/>}
                            id={'status-menu-dnd'}
                        />
                        <Menu.ItemAction
                            onClick={setOffline}
                            ariaLabel={localizeMessage('status_dropdown.set_offline', 'Offline').toLowerCase()}
                            text={localizeMessage('status_dropdown.set_offline', 'Offline')}
                            icon={<StatusOfflineIcon/>}
                            id={'status-menu-offline'}
                        />
                    </Menu.Group>
                </Menu>
            </MenuWrapper>
        );
    }
}
