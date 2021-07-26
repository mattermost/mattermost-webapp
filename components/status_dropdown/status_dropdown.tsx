// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {ReactNode} from 'react';
import {FormattedMessage} from 'react-intl';

import {Tooltip} from 'react-bootstrap';

import classNames from 'classnames';

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
import DndCustomTimePicker from 'components/dnd_custom_time_picker_modal';
import OverlayTrigger from 'components/overlay_trigger';
import CustomStatusText from 'components/custom_status/custom_status_text';
import ExpiryTime from 'components/custom_status/expiry_time';

import {ActionFunc} from 'mattermost-redux/types/actions';

import {UserCustomStatus, UserStatus, CustomStatusDuration} from 'mattermost-redux/types/users';

import './status_dropdown.scss';
import {toUTCUnix} from 'utils/datetime';
import {getCurrentDateTimeForTimezone} from 'utils/timezone';

type Props = {
    status?: string;
    userId: string;
    profilePicture: string;
    autoResetPref?: string;
    actions: {
        openModal: (modalData: {modalId: string; dialogType: any; dialogProps?: any}) => void;
        setStatus: (status: UserStatus) => ActionFunc;
        unsetCustomStatus: () => ActionFunc;
        setStatusDropdown: (open: boolean) => void;
    };
    customStatus?: UserCustomStatus;
    isCustomStatusEnabled: boolean;
    isCustomStatusExpired: boolean;
    isStatusDropdownOpen: boolean;
    showCustomStatusPulsatingDot: boolean;
    isTimedDNDEnabled: boolean;
    timezone?: string;
    globalHeader?: boolean;
}

type State = {
    openUp: boolean;
    width: number;
};

export default class StatusDropdown extends React.PureComponent <Props, State> {
    dndTimes = ['30 mins', '1 hour', '2 hours', 'Tomorrow', 'Custom']
    static defaultProps = {
        userId: '',
        profilePicture: '',
        status: UserStatuses.OFFLINE,
    }

    constructor(props: Props) {
        super(props);

        this.state = {
            openUp: false,
            width: 0,
        };
    }

    setStatus = (status: string, dndEndTime?: number): void => {
        this.props.actions.setStatus({
            user_id: this.props.userId,
            status,
            dnd_end_time: dndEndTime,
        });
    }

    isUserOutOfOffice = (): boolean => {
        return this.props.status === UserStatuses.OUT_OF_OFFICE;
    }

    setOnline = (event: Event): void => {
        event.preventDefault();
        this.setStatus(UserStatuses.ONLINE);
    }

    setOffline = (event: Event): void => {
        event.preventDefault();
        this.setStatus(UserStatuses.OFFLINE);
    }

    setAway = (event: Event): void => {
        event.preventDefault();
        this.setStatus(UserStatuses.AWAY);
    }

    setDndUntimed = (event: Event): void => {
        event.preventDefault();
        this.setStatus(UserStatuses.DND);
    }

    setDnd = (index: number): void => {
        const currentDate = this.props.timezone ? getCurrentDateTimeForTimezone(this.props.timezone) : new Date();
        const currentTime = currentDate.getTime();
        let endTime = new Date(currentTime);
        switch (index) {
        case 0:
            // add 30 minutes in current time
            endTime = new Date(currentTime + (30 * 60 * 1000));
            break;
        case 1:
            // add 1 hour in current time
            endTime = new Date(currentTime + (1 * 60 * 60 * 1000));
            break;
        case 2:
            // add 2 hours in current time
            endTime = new Date(currentTime + (2 * 60 * 60 * 1000));
            break;
        case 3:
            // add one day in current date and set hours to last minute of the day
            endTime = new Date(currentDate);
            endTime.setDate(currentDate.getDate() + 1);
            endTime.setHours(23, 59, 59, 999);
            break;
        }

        const dndEndTime = toUTCUnix(endTime);
        this.setStatus(UserStatuses.DND, dndEndTime);
    }

    setCustomTimedDnd = (): void => {
        const dndCustomTimePicker = {
            modalId: ModalIdentifiers.DND_CUSTOM_TIME_PICKER,
            dialogType: DndCustomTimePicker,
            dialogProps: {
                currentDate: this.props.timezone ? getCurrentDateTimeForTimezone(this.props.timezone) : new Date(),
            },
        };

        this.props.actions.openModal(dndCustomTimePicker);
    }

    showStatusChangeConfirmation = (status: string): void => {
        const resetStatusModalData = {
            modalId: ModalIdentifiers.RESET_STATUS,
            dialogType: ResetStatusModal,
            dialogProps: {newStatus: status},
        };

        this.props.actions.openModal(resetStatusModalData);
    };

    renderProfilePicture = (): ReactNode => {
        if (!this.props.profilePicture) {
            return null;
        }
        return (
            <Avatar
                size={this.props.globalHeader ? 'sm' : 'lg'}
                url={this.props.profilePicture}
            />
        );
    }

    renderDropdownIcon = (): ReactNode => {
        return (
            <FormattedMessage
                id='generic_icons.dropdown'
                defaultMessage='Dropdown Icon'
            >
                { (title: string) => (
                    <i
                        className={'fa fa-caret-down'}
                        aria-label={title}
                    />)
                }
            </FormattedMessage>
        );
    }
    handleClearStatus = (e: React.MouseEvent<HTMLButtonElement>): void => {
        e.stopPropagation();
        e.preventDefault();
        this.props.actions.unsetCustomStatus();
    };

    onToggle = (open: boolean): void => {
        this.props.actions.setStatusDropdown(open);
    }

    renderCustomStatus = (): ReactNode => {
        if (!this.props.isCustomStatusEnabled) {
            return null;
        }
        const {customStatus, isCustomStatusExpired} = this.props;
        const isStatusSet = customStatus && (customStatus.text.length > 0 || customStatus.emoji.length > 0) && !isCustomStatusExpired;
        const customStatusText = isStatusSet ? customStatus?.text : localizeMessage('status_dropdown.set_custom', 'Set a Custom Status');
        const customStatusEmoji = isStatusSet ? (
            <span className='d-flex'>
                <CustomStatusEmoji
                    showTooltip={false}
                    emojiStyle={{marginLeft: 0}}
                />
            </span>
        ) : (
            <EmojiIcon className={'custom-status-emoji'}/>
        );

        const clearButton = isStatusSet &&
            (
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
                    <button
                        className='style--none input-clear-x'
                        id='custom_status__clear'
                        onClick={this.handleClearStatus}
                    >
                        <i className='icon icon-close-circle'/>
                    </button>
                </OverlayTrigger>
            );

        const pulsatingDot = !isStatusSet && this.props.showCustomStatusPulsatingDot && (
            <span className='pulsating_dot'/>
        );

        const expiryTime = isStatusSet && customStatus?.expires_at && customStatus.duration !== CustomStatusDuration.DONT_CLEAR &&
            (
                <ExpiryTime
                    time={customStatus.expires_at}
                    timezone={this.props.timezone}
                    className={'custom_status__expiry MenuItem__help-text'}
                    withinBrackets={true}
                />
            );

        return (
            <Menu.Group>
                <Menu.ItemToggleModalRedux
                    accessibilityLabel='Custom Status'
                    modalId={ModalIdentifiers.CUSTOM_STATUS}
                    dialogType={CustomStatusModal}
                    className='MenuItem__primary-text custom_status__row'
                    id={'status-menu-custom-status'}
                    sibling={clearButton}
                >
                    <span className='custom_status__container'>
                        <span className='custom_status__icon'>
                            {customStatusEmoji}
                        </span>
                        <CustomStatusText
                            text={customStatusText}
                            className='custom_status__text'
                        />
                        {pulsatingDot}
                    </span>
                    {expiryTime}
                </Menu.ItemToggleModalRedux>
            </Menu.Group>
        );
    }

    render = (): JSX.Element => {
        const needsConfirm = this.isUserOutOfOffice() && this.props.autoResetPref === '';
        const profilePicture = this.renderProfilePicture();
        const dropdownIcon = this.renderDropdownIcon();
        const {isTimedDNDEnabled} = this.props;

        const setOnline = needsConfirm ? () => this.showStatusChangeConfirmation('online') : this.setOnline;
        const setDnd = needsConfirm ? () => this.showStatusChangeConfirmation('dnd') : this.setDnd;
        const setDndUntimed = needsConfirm ? () => this.showStatusChangeConfirmation('dnd') : this.setDndUntimed;
        const setAway = needsConfirm ? () => this.showStatusChangeConfirmation('away') : this.setAway;
        const setOffline = needsConfirm ? () => this.showStatusChangeConfirmation('offline') : this.setOffline;
        const setCustomTimedDnd = needsConfirm ? () => this.showStatusChangeConfirmation('dnd') : this.setCustomTimedDnd;

        const dndSubMenuItems = [{
            id: 'dndSubMenu-header',
            direction: 'right',
            text: localizeMessage('status_dropdown.dnd_sub_menu_header', 'Disable notifications until:'),
        } as any].concat(
            this.dndTimes.map((time, index) => {
                return {
                    id: `dndTime-${time.split(' ').join('')}`,
                    direction: 'right',
                    text: localizeMessage('status_dropdown.dnd_sub_menu_item.time', time),
                    action: index === 4 ? () => setCustomTimedDnd() : () => setDnd(index),
                } as any;
            }));

        const customStatusComponent = this.renderCustomStatus();

        let timedDND = (
            <Menu.ItemSubMenu
                subMenu={dndSubMenuItems}
                ariaLabel={`${localizeMessage('status_dropdown.set_dnd', 'Do not disturb').toLowerCase()}. ${localizeMessage('status_dropdown.set_dnd.extra', 'Disables desktop, email and push notifications').toLowerCase()}`}
                text={localizeMessage('status_dropdown.set_dnd', 'Do not disturb')}
                icon={<StatusDndIcon className={'dnd--icon'}/>}
                direction={'right'}
                openUp={this.state.openUp}
                id={'status-menu-dnd-timed'}
            />
        );

        if (!isTimedDNDEnabled) {
            timedDND = (
                <Menu.ItemAction
                    onClick={setDndUntimed}
                    ariaLabel={`${localizeMessage('status_dropdown.set_dnd', 'Do not disturb').toLowerCase()}. ${localizeMessage('status_dropdown.set_dnd.extra', 'Disables desktop, email and push notifications').toLowerCase()}`}
                    text={localizeMessage('status_dropdown.set_dnd', 'Do not disturb')}
                    extraText={localizeMessage('status_dropdown.set_dnd.extra', 'Disables all notifications')}
                    icon={<StatusDndIcon className={'dnd--icon'}/>}
                    id={'status-menu-dnd'}
                />
            );
        }

        return (
            <MenuWrapper
                onToggle={this.onToggle}
                open={this.props.isStatusDropdownOpen}
                className={classNames('status-dropdown-menu', {
                    'status-dropdown-menu-global-header': this.props.globalHeader,
                })}
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
                    id={isTimedDNDEnabled ? 'statusDropdownMenu-timedDND' : 'statusDropdownMenu'}
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
                        {timedDND}
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
