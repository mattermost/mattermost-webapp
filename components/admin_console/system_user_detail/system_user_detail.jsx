// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';
import {Client4} from 'mattermost-redux/client';

import {adminResetMfa} from 'actions/admin_actions.jsx';
import {Constants} from 'utils/constants.jsx';
import * as Utils from 'utils/utils.jsx';

import ProfilePicture from 'components/profile_picture.jsx';
import BlockableLink from 'components/admin_console/blockable_link';
import ResetPasswordModal from 'components/admin_console/reset_password_modal';
import AdminButtonDefault from 'components/admin_console/admin_button_default';
import AdminPanel from 'components/widgets/admin_console/admin_panel.jsx';
import ConfirmModal from 'components/confirm_modal.jsx';

const divStyle = {
    padding: '20px',
};

export default class SystemUserDetail extends React.Component {
    static propTypes = {
        user: PropTypes.object.isRequired,
        userId: PropTypes.string.isRequired,
        actions: PropTypes.shape({
            updateUserActive: PropTypes.func.isRequired,
        }).isRequired,
    }

    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            searching: false,
            showPasswordModal: false,
            showDeactivateMemberModal: false,
        };
    }

    doPasswordReset = (user) => {
        this.setState({
            showPasswordModal: true,
            user,
        });
    }

    doPasswordResetDismiss = () => {
        this.setState({
            showPasswordModal: false,
            user: null,
        });
    }

    doPasswordResetSubmit = () => {
        this.setState({
            showPasswordModal: false,
            user: null,
        });
    }

    handleMakeActive = (e) => {
        e.preventDefault();
        this.props.actions.updateUserActive(this.props.user.id, true).
            then(this.onUpdateActiveResult);
    }

    handleShowDeactivateMemberModal = (e) => {
        e.preventDefault();
        this.setState({showDeactivateMemberModal: true});
    }

    handleDeactivateMember = () => {
        this.props.actions.updateUserActive(this.props.user.id, false).
            then(this.onUpdateActiveResult);
        this.setState({showDeactivateMemberModal: false});
    }

    onUpdateActiveResult = ({error}) => {
        if (error) {
            //this.props.onError({id: error.server_error_id, ...error});
        }
    }

    handleDeactivateCancel = () => {
        this.setState({showDeactivateMemberModal: false});
    }

    // TODO: add error handler function
    handleResetMfa = (e) => {
        e.preventDefault();
        adminResetMfa(this.props.user.id, null, null);
    }

    renderDeactivateMemberModal = (user) => {
        const title = (
            <FormattedMessage
                id='deactivate_member_modal.title'
                defaultMessage='Deactivate {username}'
                values={{
                    username: user.username,
                }}
            />
        );

        let warning;
        if (user.auth_service !== '' && user.auth_service !== Constants.EMAIL_SERVICE) {
            warning = (
                <strong>
                    <br/>
                    <br/>
                    <FormattedMessage
                        id='deactivate_member_modal.sso_warning'
                        defaultMessage='You must also deactivate this user in the SSO provider or they will be reactivated on next login or sync.'
                    />
                </strong>
            );
        }

        const message = (
            <div>
                <FormattedMessage
                    id='deactivate_member_modal.desc'
                    defaultMessage='This action deactivates {username}. They will be logged out and not have access to any teams or channels on this system. Are you sure you want to deactivate {username}?'
                    values={{
                        username: user.username,
                    }}
                />
                {warning}
            </div>
        );

        const confirmButtonClass = 'btn btn-danger';
        const deactivateMemberButton = (
            <FormattedMessage
                id='deactivate_member_modal.deactivate'
                defaultMessage='Deactivate'
            />
        );

        return (
            <ConfirmModal
                show={this.state.showDeactivateMemberModal}
                title={title}
                message={message}
                confirmButtonClass={confirmButtonClass}
                confirmButtonText={deactivateMemberButton}
                onConfirm={this.handleDeactivateMember}
                onCancel={this.handleDeactivateCancel}
            />
        );
    }

    renderActivateDeactivate = () => {
        if (this.props.user.delete_at > 0) {
            return (
                <AdminButtonDefault
                    onClick={this.handleMakeActive}
                    className='admin-btn-default'
                >
                    {Utils.localizeMessage('admin.user_item.makeActive', 'Activate')}
                </AdminButtonDefault>
            );
        }
        return (
            <AdminButtonDefault
                onClick={this.handleShowDeactivateMemberModal}
                className='admin-btn-default'
            >
                {Utils.localizeMessage('admin.user_item.makeInactive', 'Deactivate')}
            </AdminButtonDefault>
        );
    }

    renderRemoveMFA = () => {
        if (this.props.user.mfa_active) {
            return (
                <AdminButtonDefault
                    onClick={this.handleResetMfa}
                    className='admin-btn-default'
                >
                    {'Remove MFA'}
                </AdminButtonDefault>
            );
        }
        return null;
    }

    render() {
        // TODO: Refactor logic, get user object if not available
        const {user} = this.props;
        let firstName;
        let lastName;
        let nickname;
        let deactivateMemberModal;
        let currentRoles = (
            <FormattedMessage
                id='admin.user_item.member'
                defaultMessage='Member'
            />
        );

        if (user) {
            firstName = user.first_name ? user.first_name : '(First name)';
            lastName = user.last_name ? user.last_name : '(Last name)';
            nickname = user.nickname ? user.nickname : '(Nickname)';
            deactivateMemberModal = this.renderDeactivateMemberModal(user);
            if (user.delete_at > 0) {
                currentRoles = (
                    <FormattedMessage
                        id='admin.user_item.inactive'
                        defaultMessage='Inactive'
                    />
                );
            }
            if (user.roles.length > 0 && Utils.isSystemAdmin(user.roles)) {
                currentRoles = (
                    <FormattedMessage
                        id='team_members_dropdown.systemAdmin'
                        defaultMessage='System Admin'
                    />
                );
            }
        }

        if (!user) {
            return (
                <div>
                    <h1>{'No user object'}</h1>
                    <BlockableLink
                        to='/admin_console/user_management/users'
                        className='fa fa-angle-left back'
                    >
                        {'Back to Users'}
                    </BlockableLink>
                </div>
            );
        }

        return (
            <div className='wrapper--fixed'>
                <div className='admin-console__header with-back'>
                    <div>
                        <BlockableLink
                            to='/admin_console/user_management/users'
                            className='fa fa-angle-left back'
                        />
                        <FormattedMessage
                            id='admin.systemUserDetail.title'
                            defaultMessage='User Configuration'
                        />
                    </div>
                </div>
                <div className='admin-console__wrapper'>
                    <div className='admin-console__content'>
                        <AdminPanel
                            titleId='(First Name) (Last Name) • (Nickname)'
                            titleDefault={firstName + ' ' + lastName + ' | ' + nickname}
                            subtitleId='(Position)'
                            subtitleDefault={user.position ? user.position : ''}
                        >
                            <div style={divStyle}>
                                <ProfilePicture
                                    src={Client4.getProfilePictureUrl(user.id, user.last_picture_update)}
                                    width='32'
                                    height='32'
                                />
                                <p><b>{'Email: '}</b>{user.email}</p>
                                <p><b>{'Username: '}</b>{user.username}</p>
                                <p><b>{'Authentication Method: '}</b>{user.mfa_active ? 'MFA' : 'Email'}</p>
                                <p><b>{'Role: '}</b>{currentRoles}</p>
                                <AdminButtonDefault
                                    onClick={this.doPasswordReset}
                                    className='admin-btn-default'
                                >
                                    {'Reset Password'}
                                </AdminButtonDefault>
                                {this.renderActivateDeactivate()}
                                {this.renderRemoveMFA()}
                            </div>
                        </AdminPanel>
                    </div>
                </div>
                <ResetPasswordModal
                    user={user}
                    show={this.state.showPasswordModal}
                    onModalSubmit={this.doPasswordResetSubmit}
                    onModalDismissed={this.doPasswordResetDismiss}
                />
                {deactivateMemberModal}
            </div>
        );
    }
}
