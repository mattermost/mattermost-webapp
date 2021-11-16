// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import StatusIcon from '@mattermost/compass-components/components/status-icon';
import Text from '@mattermost/compass-components/components/text';
import Icon from '@mattermost/compass-components/foundations/icon/Icon';
import {TUserStatus} from '@mattermost/compass-components/shared';

import classNames from 'classnames';

import React, {ReactNode} from 'react';

import {FormattedDate, FormattedMessage, FormattedTime} from 'react-intl';

import * as GlobalActions from 'actions/global_actions';
import CustomStatusEmoji from 'components/custom_status/custom_status_emoji';
import CustomStatusModal from 'components/custom_status/custom_status_modal';
import CustomStatusText from 'components/custom_status/custom_status_text';
import ExpiryTime from 'components/custom_status/expiry_time';
import DndCustomTimePicker from 'components/dnd_custom_time_picker_modal';
import LocalizedIcon from 'components/localized_icon';
import ResetStatusModal from 'components/reset_status_modal';
import UserSettingsModal from 'components/user_settings/modal';
import EmojiIcon from 'components/widgets/icons/emoji_icon';
import Menu from 'components/widgets/menu/menu';
import MenuWrapper from 'components/widgets/menu/menu_wrapper';
import PulsatingDot from 'components/widgets/pulsating_dot';
import Avatar, {TAvatarSizeToken} from 'components/widgets/users/avatar/avatar';
import {ActionFunc} from 'mattermost-redux/types/actions';
import {CustomStatusDuration, UserCustomStatus, UserProfile, UserStatus} from 'mattermost-redux/types/users';

import {ModalData} from 'types/actions';

import {ModalIdentifiers, UserStatuses} from 'utils/constants';
import {t} from 'utils/i18n';
import {getCurrentDateTimeForTimezone, getCurrentMomentForTimezone} from 'utils/timezone';
import {localizeMessage} from 'utils/utils.jsx';
import './status_dropdown.scss';

type Props = {
    status?: string;
    userId: string;
    profilePicture: string;
    autoResetPref?: string;
    actions: {
        openModal: <P>(modalData: ModalData<P>) => void;
        setStatus: (status: UserStatus) => ActionFunc;
        unsetCustomStatus: () => ActionFunc;
        setStatusDropdown: (open: boolean) => void;
    };
    customStatus?: UserCustomStatus;
    currentUser: UserProfile;
    isCustomStatusEnabled: boolean;
    isCustomStatusExpired: boolean;
    isMilitaryTime: boolean;
    isStatusDropdownOpen: boolean;
    showCustomStatusPulsatingDot: boolean;
    timezone?: string;
    globalHeader?: boolean;
}

type State = {
    openUp: boolean;
    width: number;
    isStatusSet: boolean;
};

export default class StatusDropdown extends React.PureComponent<Props, State> {
    dndTimes = [
        {id: 'thirty_minutes', label: t('status_dropdown.dnd_sub_menu_item.thirty_minutes'), labelDefault: '30 mins'},
        {id: 'one_hour', label: t('status_dropdown.dnd_sub_menu_item.one_hour'), labelDefault: '1 hour'},
        {id: 'two_hours', label: t('status_dropdown.dnd_sub_menu_item.two_hours'), labelDefault: '2 hours'},
        {id: 'tomorrow', label: t('status_dropdown.dnd_sub_menu_item.tomorrow'), labelDefault: 'Tomorrow'},
        {id: 'custom', label: t('status_dropdown.dnd_sub_menu_item.custom'), labelDefault: 'Custom'},
    ];
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
            isStatusSet: false,
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

    setDnd = (index: number): void => {
        const currentDate = getCurrentMomentForTimezone(this.props.timezone);
        let endTime = currentDate;
        switch (index) {
        case 0:
            // add 30 minutes in current time
            endTime = currentDate.add(30, 'minutes');
            break;
        case 1:
            // add 1 hour in current time
            endTime = currentDate.add(1, 'hour');
            break;
        case 2:
            // add 2 hours in current time
            endTime = currentDate.add(2, 'hours');
            break;
        case 3:
            // add one day in current date
            endTime = currentDate.add(1, 'day');
            break;
        }

        this.setStatus(UserStatuses.DND, endTime.utc().unix());
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

    renderProfilePicture = (size: TAvatarSizeToken): ReactNode => {
        if (!this.props.profilePicture) {
            return null;
        }
        return (
            <Avatar
                size={size}
                url={this.props.profilePicture}
            />
        );
    }

    renderDropdownIcon = (): ReactNode => {
        return (
            <LocalizedIcon
                className={'fa fa-caret-down'}
                ariaLabel={{id: t('generic_icons.dropdown'), defaultMessage: 'Dropdown Icon'}}
            />
        );
    }

    handleClearStatus = (e: React.MouseEvent<HTMLButtonElement>): void => {
        e.stopPropagation();
        e.preventDefault();
        this.props.actions.unsetCustomStatus();
    };

    handleEmitUserLoggedOutEvent = (): void => {
        GlobalActions.emitUserLoggedOutEvent();
    }

    onToggle = (open: boolean): void => {
        this.props.actions.setStatusDropdown(open);
    }

    handleCustomStatusEmojiClick = (event: React.MouseEvent): void => {
        event.stopPropagation();
        const customStatusInputModalData = {
            modalId: ModalIdentifiers.CUSTOM_STATUS,
            dialogType: CustomStatusModal,
        };
        this.props.actions.openModal(customStatusInputModalData);
    }

    renderCustomStatus = (isStatusSet: boolean | undefined): ReactNode => {
        if (!this.props.isCustomStatusEnabled) {
            return null;
        }
        const {customStatus} = this.props;

        let customStatusText;
        let customStatusHelpText;
        switch (true) {
        case isStatusSet && customStatus?.text && customStatus.text.length > 0:
            customStatusText = customStatus?.text;
            break;
        case isStatusSet && !customStatus?.text && customStatus?.duration === CustomStatusDuration.DONT_CLEAR:
            customStatusHelpText = localizeMessage('status_dropdown.set_custom_text', 'Set Custom Status Text...');
            break;
        case isStatusSet && !customStatus?.text && customStatus?.duration !== CustomStatusDuration.DONT_CLEAR:
            customStatusText = '';
            break;
        case !isStatusSet:
            customStatusHelpText = localizeMessage('status_dropdown.set_custom', 'Set a Custom Status');
        }

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

        const pulsatingDot = !isStatusSet && this.props.showCustomStatusPulsatingDot && (
            <PulsatingDot/>
        );

        const expiryTime = isStatusSet && customStatus?.expires_at && customStatus.duration !== CustomStatusDuration.DONT_CLEAR &&
            (
                <ExpiryTime
                    time={customStatus.expires_at}
                    timezone={this.props.timezone}
                    className={classNames('custom_status__expiry', {
                        padded: customStatus?.text.length > 0,
                    })}
                    withinBrackets={true}
                />
            );

        return (
            <Menu.Group>
                <Menu.ItemToggleModalRedux
                    ariaLabel='Custom Status'
                    modalId={ModalIdentifiers.CUSTOM_STATUS}
                    dialogType={CustomStatusModal}
                    className={classNames('MenuItem__primary-text custom_status__row', {
                        flex: customStatus?.text.length === 0,
                    })}
                    id={'status-menu-custom-status'}
                >
                    <span className='custom_status__container'>
                        <span className='custom_status__icon'>
                            {customStatusEmoji}
                        </span>
                        <CustomStatusText
                            text={customStatusText}
                            className='custom_status__text'
                        />
                        <Text
                            margin='none'
                            color='disabled'
                        >
                            {customStatusHelpText}
                        </Text>
                        {pulsatingDot}
                    </span>
                    {expiryTime}
                </Menu.ItemToggleModalRedux>
            </Menu.Group>
        );
    }

    render = (): JSX.Element => {
        const needsConfirm = this.isUserOutOfOffice() && this.props.autoResetPref === '';
        const dropdownIcon = this.renderDropdownIcon();
        const {status, customStatus, isCustomStatusExpired, globalHeader, currentUser} = this.props;
        const isStatusSet = customStatus && (customStatus.text.length > 0 || customStatus.emoji.length > 0) && !isCustomStatusExpired;

        const setOnline = needsConfirm ? () => this.showStatusChangeConfirmation('online') : this.setOnline;
        const setDnd = needsConfirm ? () => this.showStatusChangeConfirmation('dnd') : this.setDnd;
        const setAway = needsConfirm ? () => this.showStatusChangeConfirmation('away') : this.setAway;
        const setOffline = needsConfirm ? () => this.showStatusChangeConfirmation('offline') : this.setOffline;
        const setCustomTimedDnd = needsConfirm ? () => this.showStatusChangeConfirmation('dnd') : this.setCustomTimedDnd;

        const selectedIndicator = (
            <Icon
                glyph={'check'}
                size={16}
                color={'success'}
            />
        );

        const dndSubMenuItems = [
            {
                id: 'dndSubMenu-header',
                direction: 'right',
                text: localizeMessage('status_dropdown.dnd_sub_menu_header', 'Disable notifications until:'),
            } as any,
        ].concat(
            this.dndTimes.map(({id, label, labelDefault}, index) => {
                let text: React.ReactNode = localizeMessage(label, labelDefault);
                if (index === 3) {
                    const tomorrow = getCurrentMomentForTimezone(this.props.timezone).add(1, 'day').toDate();
                    text = (
                        <>
                            {text}
                            <span className={`dndTime-${id}_timestamp`}>
                                <FormattedDate
                                    value={tomorrow}
                                    weekday='short'
                                />
                                {', '}
                                <FormattedTime
                                    value={tomorrow}
                                    timeStyle='short'
                                    hour12={!this.props.isMilitaryTime}
                                />
                            </span>
                        </>
                    );
                }
                return {
                    id: `dndTime-${id}`,
                    direction: 'right',
                    text,
                    action:
                        index === 4 ? () => setCustomTimedDnd() : () => setDnd(index),
                } as any;
            }),
        );

        const customStatusComponent = this.renderCustomStatus(isStatusSet);

        return (
            <MenuWrapper
                onToggle={this.onToggle}
                open={this.props.isStatusDropdownOpen}
                className={classNames('status-dropdown-menu', {
                    'status-dropdown-menu-global-header': globalHeader,
                    active: this.props.isStatusDropdownOpen || isStatusSet,
                })}
            >
                <div
                    className={classNames('status-wrapper', {
                        'status-selector': !globalHeader,
                    })}
                >
                    {globalHeader &&
                        <CustomStatusEmoji
                            showTooltip={true}
                            tooltipDirection={'bottom'}
                            emojiStyle={{marginRight: '6px'}}
                            onClick={this.handleCustomStatusEmojiClick as () => void}
                        />
                    }
                    {this.renderProfilePicture(globalHeader ? 'sm' : 'lg')}
                    <button
                        className='status style--none'
                        aria-label={localizeMessage('status_dropdown.menuAriaLabel', 'Set a status')}
                    >
                        <StatusIcon
                            size={'sm'}
                            status={(this.props.status || 'offline') as TUserStatus}
                        />
                    </button>
                    <span className={'status status-edit edit'}>
                        {!globalHeader && dropdownIcon}
                    </span>
                </div>
                <Menu
                    ariaLabel={localizeMessage('status_dropdown.menuAriaLabel', 'Set a status')}
                    id={'statusDropdownMenu'}
                >
                    {!this.props.isCustomStatusEnabled && (
                        <Menu.Header>
                            <FormattedMessage
                                id='status_dropdown.set_your_status'
                                defaultMessage='Status'
                            />
                        </Menu.Header>
                    )}
                    {globalHeader && currentUser && (
                        <Menu.Header>
                            {this.renderProfilePicture('lg')}
                            <div className={'username-wrapper'}>
                                <Text margin={'none'}>{`${currentUser.first_name} ${currentUser.last_name}`}</Text>
                                <Text
                                    margin={'none'}
                                    color={!currentUser.first_name && !currentUser.last_name ? 'secondary' : 'disabled'}
                                >
                                    {'@' + currentUser.username}
                                </Text>
                            </div>
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
                            icon={(
                                <StatusIcon
                                    status={'online'}
                                    className={'status-icon'}
                                />
                            )}
                            rightDecorator={status === 'online' && selectedIndicator}
                            id={'status-menu-online'}
                        />
                        <Menu.ItemAction
                            onClick={setAway}
                            ariaLabel={localizeMessage('status_dropdown.set_away', 'Away').toLowerCase()}
                            text={localizeMessage('status_dropdown.set_away', 'Away')}
                            icon={(
                                <StatusIcon
                                    status={'away'}
                                    className={'status-icon'}
                                />
                            )}
                            rightDecorator={status === 'away' && selectedIndicator}
                            id={'status-menu-away'}
                        />
                        <Menu.ItemSubMenu
                            subMenu={dndSubMenuItems}
                            ariaLabel={`${localizeMessage('status_dropdown.set_dnd', 'Do not disturb').toLowerCase()}. ${localizeMessage('status_dropdown.set_dnd.extra', 'Disables desktop, email and push notifications').toLowerCase()}`}
                            text={localizeMessage('status_dropdown.set_dnd', 'Do not disturb')}
                            extraText={localizeMessage('status_dropdown.set_dnd.extra', 'Disables all notifications')}
                            icon={(
                                <StatusIcon
                                    status={'dnd'}
                                    className={'status-icon'}
                                />
                            )}
                            rightDecorator={status === 'dnd' && selectedIndicator}
                            direction={globalHeader ? 'left' : 'right'}
                            openUp={this.state.openUp}
                            id={'status-menu-dnd'}
                        />
                        <Menu.ItemAction
                            onClick={setOffline}
                            ariaLabel={localizeMessage('status_dropdown.set_offline', 'Offline').toLowerCase()}
                            text={localizeMessage('status_dropdown.set_offline', 'Offline')}
                            icon={(
                                <StatusIcon
                                    status={'offline'}
                                    className={'status-icon'}
                                />
                            )}
                            rightDecorator={status === 'offline' && selectedIndicator}
                            id={'status-menu-offline'}
                        />
                    </Menu.Group>
                    <Menu.Group>
                        <Menu.ItemToggleModalRedux
                            id='accountSettings'
                            ariaLabel='Profile}'
                            modalId={ModalIdentifiers.USER_SETTINGS}
                            dialogType={UserSettingsModal}
                            dialogProps={{isContentProductSettings: false}}
                            text={localizeMessage('navbar_dropdown.accountSettings', 'Profile')}
                            icon={globalHeader ? (
                                <Icon
                                    size={16}
                                    glyph={'account-outline'}
                                />
                            ) : <i className='fa fa-cog'/>}
                        />
                    </Menu.Group>
                    <Menu.Group>
                        <Menu.ItemAction
                            id='logout'
                            onClick={this.handleEmitUserLoggedOutEvent}
                            text={localizeMessage('navbar_dropdown.logout', 'Log Out')}
                            icon={globalHeader ? (
                                <Icon
                                    size={16}
                                    glyph={'exit-to-app'}
                                />
                            ) : <i className='fa fa-sign-out'/>}
                        />
                    </Menu.Group>
                </Menu>
            </MenuWrapper>
        );
    }
}
