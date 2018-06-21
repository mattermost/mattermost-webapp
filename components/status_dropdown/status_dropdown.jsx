// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {Dropdown} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';

import {UserStatuses, ModalIdentifiers} from 'utils/constants.jsx';
import {localizeMessage} from 'utils/utils.jsx';
import BootstrapSpan from 'components/bootstrap_span.jsx';
import ResetStatusModal from 'components/reset_status_modal';
import StatusIcon from 'components/status_icon.jsx';

export default class StatusDropdown extends React.Component {
    static propTypes = {
        style: PropTypes.object,
        status: PropTypes.string,
        userId: PropTypes.string.isRequired,
        profilePicture: PropTypes.string,
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

    state = {
        showDropdown: false,
    }

    isUserOutOfOffice = () => {
        return this.props.status === UserStatuses.OUT_OF_OFFICE;
    }

    onToggle = (showDropdown) => {
        this.setState({showDropdown});
    }

    closeDropdown = () => {
        this.setState({showDropdown: false});
    }

    setStatus = (status) => {
        this.props.actions.setStatus({
            user_id: this.props.userId,
            status,
        });
        this.closeDropdown();
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
        this.closeDropdown();

        const resetStatusModalData = {
            ModalId: ModalIdentifiers.RESET_STATUS,
            dialogType: ResetStatusModal,
            dialogProps: {newStatus: status},
        };

        this.props.actions.openModal(resetStatusModalData);
    };

    renderStatusOnlineAction = () => {
        if (this.isUserOutOfOffice()) {
            return this.renderStatusAction(UserStatuses.ONLINE, () => this.showStatusChangeConfirmation('online'));
        }
        return this.renderStatusAction(UserStatuses.ONLINE, this.setOnline);
    }

    renderStatusAwayAction = () => {
        if (this.isUserOutOfOffice()) {
            return this.renderStatusAction(UserStatuses.AWAY, () => this.showStatusChangeConfirmation('away'));
        }
        return this.renderStatusAction(UserStatuses.AWAY, this.setAway);
    }

    renderStatusOfflineAction = () => {
        if (this.isUserOutOfOffice()) {
            return this.renderStatusAction(UserStatuses.OFFLINE, () => this.showStatusChangeConfirmation('offline'));
        }
        return this.renderStatusAction(UserStatuses.OFFLINE, this.setOffline);
    }

    renderStatusDndAction = () => {
        if (this.isUserOutOfOffice()) {
            return this.renderStatusAction(UserStatuses.DND, () => this.showStatusChangeConfirmation('dnd'), localizeMessage('status_dropdown.set_dnd.extra', 'Disables Desktop and Push Notifications'));
        }
        return this.renderStatusAction(UserStatuses.DND, this.setDnd, localizeMessage('status_dropdown.set_dnd.extra', 'Disables Desktop and Push Notifications'));
    }

    renderStatusOutOfOfficeAction = () => {
        return this.renderOOFStatusAction(UserStatuses.OUT_OF_OFFICE, localizeMessage('status_dropdown.set_ooo.extra', 'Automatic Replies are enabled'));
    }

    renderProfilePicture = () => {
        if (!this.props.profilePicture) {
            return null;
        }
        return (
            <img
                className='user__picture'
                src={this.props.profilePicture}
            />
        );
    }

    renderOOFStatusAction = (status, extraText) => {
        return (
            <li key={status}>
                <a
                    className='out_of_office'
                    id={'status' + status}
                >
                    <FormattedMessage
                        id={`status_dropdown.set_${status}`}
                        defaultMessage={status}
                    />
                    <span className='status-dropdown-extra'>{extraText}</span>
                </a>
            </li>
        );
    }

    renderStatusAction = (status, onClick, extraText) => {
        return (
            <li key={status}>
                <a
                    id={'status' + status}
                    href={'#'}
                    onClick={onClick}
                >
                    <FormattedMessage
                        id={`status_dropdown.set_${status}`}
                        defaultMessage={status}
                    />
                    <span className='status-dropdown-extra'>{extraText}</span>
                </a>
            </li>
        );
    }

    render() {
        const profilePicture = this.renderProfilePicture();
        let actions = [
            this.renderStatusOnlineAction(),
            this.renderStatusAwayAction(),
            this.renderStatusDndAction(),
            this.renderStatusOfflineAction(),
        ];

        if (this.isUserOutOfOffice()) {
            const divider = (
                <li
                    className='divider'
                    key='oof_divider'
                />
            );
            actions = [
                this.renderStatusOutOfOfficeAction(),
                divider,
                ...actions,
            ];
        }

        return (
            <Dropdown
                id={'status-dropdown'}
                open={this.state.showDropdown}
                onToggle={this.onToggle}
                style={this.props.style}
            >
                <BootstrapSpan
                    bsRole={'toggle'}
                >
                    <div className='status-wrapper status-selector'>
                        {profilePicture}
                        <StatusIcon status={this.props.status}/>
                        <span className={'status status-edit edit'}>
                            <i
                                className={'fa fa-caret-down'}
                                title={localizeMessage('generic_icons.dropdown', 'Dropdown Icon')}
                            />
                        </span>
                    </div>
                </BootstrapSpan>
                <Dropdown.Menu id='editStatusMenu'>
                    {actions}
                </Dropdown.Menu>
            </Dropdown>
        );
    }
}
