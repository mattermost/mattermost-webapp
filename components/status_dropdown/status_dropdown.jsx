// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';

import {UserStatuses, ModalIdentifiers} from 'utils/constants';
import {localizeMessage} from 'utils/utils.jsx';
import ResetStatusModal from 'components/reset_status_modal';
import StatusIcon from 'components/status_icon';

import Avatar from 'components/widgets/users/avatar';
import Menu from 'components/widgets/menu/menu';
import MenuWrapper from 'components/widgets/menu/menu_wrapper';
import StatusAwayIcon from 'components/widgets/icons/status_away_icon';
import StatusOnlineIcon from 'components/widgets/icons/status_online_icon';
import StatusDndIcon from 'components/widgets/icons/status_dnd_icon';
import StatusOfflineIcon from 'components/widgets/icons/status_offline_icon';
import DndCustomTimePicker from 'components/dnd_custom_time_picker_modal';
import {getCurrentDateTimeForTimezone} from 'utils/timezone';

import './status_dropdown.scss';

export default class StatusDropdown extends React.PureComponent {
    static propTypes = {
        style: PropTypes.object,
        status: PropTypes.string,
        userId: PropTypes.string.isRequired,
        userTimezone: PropTypes.object,
        isTimezoneEnabled: PropTypes.bool,
        profilePicture: PropTypes.string,
        autoResetPref: PropTypes.string,
        actions: PropTypes.shape({
            openModal: PropTypes.func.isRequired,
            setStatus: PropTypes.func.isRequired,
        }).isRequired,
    }

    static defaultProps = {
        userId: '',
        profilePicture: '',
        status: UserStatuses.OFFLINE,
    }

    constructor(props) {
        super(props);

        this.state = {
            openUp: false,
            width: 0,
        };
    }

    getCurrentDateTime = (tz, enable) => {
        let currentDate;
        if (enable) {
            if (tz.useAutomaticTimezone) {
                currentDate = getCurrentDateTimeForTimezone(tz.automaticTimezone);
            } else {
                currentDate = getCurrentDateTimeForTimezone(tz.manualTimezone);
            }
        }
        return currentDate;
    }

    dndTimes = ['30 mins', '1 hour', '2 hours', 'Today', 'Tomorrow', 'Custom']

    isUserOutOfOffice = () => {
        return this.props.status === UserStatuses.OUT_OF_OFFICE;
    }

    setStatus = (status, dndEndTime) => {
        this.props.actions.setStatus({
            user_id: this.props.userId,
            status,
            dnd_end_time: dndEndTime,
        });
    }

    setOnline = (event) => {
        event.preventDefault();
        this.setStatus(UserStatuses.ONLINE, '');
    }

    setOffline = (event) => {
        event.preventDefault();
        this.setStatus(UserStatuses.OFFLINE, '');
    }

    setAway = (event) => {
        event.preventDefault();
        this.setStatus(UserStatuses.AWAY, '');
    }

    setDnd = (event, index) => {
        event.preventDefault();

        var currentTime = this.getCurrentDateTime(this.props.userTimezone, this.props.isTimezoneEnabled).getTime();
        var endTime = new Date().getTime();
        switch (index) {
        case 0:
            endTime = new Date(currentTime + (30 * 60 * 1000));
            break;
        case 1:
            endTime = new Date(currentTime + (1 * 60 * 60 * 1000));
            break;
        case 2:
            // add 2 hours in current time
            endTime = new Date(currentTime + (2 * 60 * 60 * 1000));
            break;
        case 3:
            // set hours of date to point to last moment of the day
            endTime.setHours(23, 59, 59, 999);
            break;
        case 4:
            // set hours of date to point to last moment of the day
            // and add 24 hours to it to point to last moment of tomorrow
            currentTime.setHours(23, 59, 59, 999);
            endTime = new Date(currentTime + (24 * 60 * 60 * 1000));
            break;
        }

        var dndEndTime = endTime.toISOString();
        this.setStatus(UserStatuses.DND, dndEndTime);
    }

    setCustomTimedDnd = () => {
        const dndCustomTimePicker = {
            ModalId: ModalIdentifiers.DND_CUSTOM_TIME_PICKER,
            dialogType: DndCustomTimePicker,
            dialogProps: {
                userId: this.props.userId,
                userTimezone: this.props.userTimezone,
                isTimezoneEnabled: this.props.isTimezoneEnabled,
                getCurrentDateTime: this.getCurrentDateTime,
            },
        };

        this.props.actions.openModal(dndCustomTimePicker);
    }

    showStatusChangeConfirmation = (status) => {
        const resetStatusModalData = {
            ModalId: ModalIdentifiers.RESET_STATUS,
            dialogType: ResetStatusModal,
            dialogProps: {newStatus: status},
        };

        this.props.actions.openModal(resetStatusModalData);
    };

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

    refCallback = (menuRef) => {
        if (menuRef) {
            this.setState({
                width: menuRef.rect()?.width - 12,
            });
        }
    }

    render() {
        const needsConfirm = this.isUserOutOfOffice() && this.props.autoResetPref === '';
        const profilePicture = this.renderProfilePicture();
        const dropdownIcon = this.renderDropdownIcon();

        const setOnline = needsConfirm ? () => this.showStatusChangeConfirmation('online') : this.setOnline;
        const setDnd = needsConfirm ? () => this.showStatusChangeConfirmation('dnd') : this.setDnd;
        const setAway = needsConfirm ? () => this.showStatusChangeConfirmation('away') : this.setAway;
        const setOffline = needsConfirm ? () => this.showStatusChangeConfirmation('offline') : this.setOffline;
        const setCustomTimedDnd = needsConfirm ? () => this.showStatusChangeConfirmation('dnd') : this.setCustomTimedDnd;

        const dndSubMenuItems = this.dndTimes.map((time, index) => {
            return {
                id: `dndTime-${index}-${time.split(' ')[0]}`,
                direction: 'right',
                text: localizeMessage('status_dropdown.dnd_sub_menu_item.time',time),
                action: index === 5 ? () => setCustomTimedDnd() : () => setDnd(event, index),
            };
        });

        return (
            <MenuWrapper
                onToggle={this.onToggle}
                style={this.props.style}
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
                    ref={this.refCallback}
                >
                    <Menu.Header>
                        <FormattedMessage
                            id='status_dropdown.set_your_status'
                            defaultMessage='Set your status'
                        />
                    </Menu.Header>
                    <Menu.Group>
                        <Menu.ItemAction
                            show={this.isUserOutOfOffice()}
                            onClick={() => null}
                            ariaLabel={localizeMessage('status_dropdown.set_ooo', 'Out of office').toLowerCase()}
                            text={localizeMessage('status_dropdown.set_ooo', 'Out of office')}
                            extraText={localizeMessage('status_dropdown.set_ooo.extra', 'Automatic Replies are enabled')}
                        />
                    </Menu.Group>
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
                        <Menu.ItemSubMenu
                            subMenu={dndSubMenuItems}
                            subMenuClass={'px-6'}
                            ariaLabel={`${localizeMessage('status_dropdown.set_dnd', 'Do not disturb').toLowerCase()}. ${localizeMessage('status_dropdown.set_dnd.extra', 'Disables desktop, email and push notifications').toLowerCase()}`}
                            text={localizeMessage('status_dropdown.set_dnd', 'Do not disturb')}
                            extraText={localizeMessage('status_dropdown.set_dnd.extra', 'Disables all notifications')}
                            icon={<StatusDndIcon className={'dnd--icon'}/>}
                            direction={'right'}
                            openUp={this.state.openUp}
                            xOffset={this.state.width}
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
