// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {Dropdown} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';

import {UserStatuses} from 'utils/constants.jsx';

import BootstrapSpan from 'components/bootstrap_span.jsx';
import StatusIcon from 'components/status_icon.jsx';

export default class StatusDropdown extends React.Component {

    static propTypes = {
        style: PropTypes.object,
        status: PropTypes.string,
        userId: PropTypes.string.isRequired,
        profilePicture: PropTypes.string,
        actions: PropTypes.shape({
            setStatus: PropTypes.func.isRequired
        }).isRequired
    }

    state = {
        showDropdown: false
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
            status
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

    renderStatusOnlineAction = () => {
        return this.renderStatusAction(UserStatuses.ONLINE, this.setOnline);
    }

    renderStatusAwayAction = () => {
        return this.renderStatusAction(UserStatuses.AWAY, this.setAway);
    }

    renderStatusOfflineAction = () => {
        return this.renderStatusAction(UserStatuses.OFFLINE, this.setOffline);
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

    renderStatusAction = (status, onClick) => {
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
                </a>
            </li>
        );
    }

    render() {
        const profilePicture = this.renderProfilePicture();
        const actions = [
            this.renderStatusOnlineAction(),
            this.renderStatusAwayAction(),
            this.renderStatusOfflineAction()
        ];
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
                            <i className={'fa fa-caret-down'}/>
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
