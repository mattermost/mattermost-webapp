// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';

import {UserStatuses, ModalIdentifiers} from 'utils/constants';
import {localizeMessage} from 'utils/utils.jsx';
import ResetStatusModal from 'components/reset_status_modal';
import StatusIcon from 'components/status_icon.jsx';

import Avatar from 'components/widgets/users/avatar';
import Menu from 'components/widgets/menu/menu';
import MenuWrapper from 'components/widgets/menu/menu_wrapper';

export default class StatusDropdown extends React.Component {
    static propTypes = {
        style: PropTypes.object,
        status: PropTypes.string,
        userId: PropTypes.string.isRequired,
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
                        title={title}
                    />)
                }
            </FormattedMessage>
        );
    }

    render() {
        const needsConfirm = this.isUserOutOfOffice() && this.props.autoResetPref === '';
        const profilePicture = this.renderProfilePicture();
        const dropdownIcon = this.renderDropdownIcon();

        const setOnline = needsConfirm ? () => this.showStatusChangeConfirmation('online') : this.setOnline;
        const setDnd = needsConfirm ? () => this.showStatusChangeConfirmation('dnd') : this.setDnd;
        const setAway = needsConfirm ? () => this.showStatusChangeConfirmation('away') : this.setAway;
        const setOffline = needsConfirm ? () => this.showStatusChangeConfirmation('offline') : this.setOffline;

        return (
            <MenuWrapper
                onToggle={this.onToggle}
                style={this.props.style}
            >
                <div className='status-wrapper status-selector'>
                    {profilePicture}
                    <button
                        className='status style--none'
                        aria-label={localizeMessage('status_dropdown.menuAriaLabel', 'set status')}
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
                <Menu ariaLabel={localizeMessage('status_dropdown.menuAriaLabel', 'set status')}>
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
                        />
                        <Menu.ItemAction
                            onClick={setAway}
                            ariaLabel={localizeMessage('status_dropdown.set_away', 'Away').toLowerCase()}
                            text={localizeMessage('status_dropdown.set_away', 'Away')}
                        />
                        <Menu.ItemAction
                            onClick={setDnd}
                            ariaLabel={`${localizeMessage('status_dropdown.set_dnd', 'Do not disturb').toLowerCase()}. ${localizeMessage('status_dropdown.set_dnd.extra', 'Disables desktop, email and push notifications').toLowerCase()}`}
                            text={localizeMessage('status_dropdown.set_dnd', 'Do not disturb')}
                            extraText={localizeMessage('status_dropdown.set_dnd.extra', 'Disables desktop, email and push notifications')}
                        />
                        <Menu.ItemAction
                            onClick={setOffline}
                            ariaLabel={localizeMessage('status_dropdown.set_offline', 'Offline').toLowerCase()}
                            text={localizeMessage('status_dropdown.set_offline', 'Offline')}
                        />
                    </Menu.Group>
                </Menu>
            </MenuWrapper>
        );
    }
}
