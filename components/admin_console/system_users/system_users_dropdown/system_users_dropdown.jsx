// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';
import * as UserUtils from 'mattermost-redux/utils/user_utils';
import {Permissions} from 'mattermost-redux/constants';

import {adminResetMfa} from 'actions/admin_actions.jsx';
import {Constants} from 'utils/constants.jsx';
import * as Utils from 'utils/utils.jsx';
import {t} from 'utils/i18n';
import {emitUserLoggedOutEvent} from 'actions/global_actions.jsx';
import ConfirmModal from 'components/confirm_modal.jsx';
import SystemPermissionGate from 'components/permissions_gates/system_permission_gate';

import MenuWrapper from 'components/widgets/menu/menu_wrapper';
import Menu from 'components/widgets/menu/menu';
import MenuItemAction from 'components/widgets/menu/menu_items/menu_item_action';

export default class SystemUsersDropdown extends React.Component {
    static propTypes = {

        /*
         * User to manage with dropdown
         */
        user: PropTypes.object.isRequired,

        /**
         * Whether MFA is licensed and enabled.
         */
        mfaEnabled: PropTypes.bool.isRequired,

        /**
         * Whether or not user access tokens are enabled.
         */
        enableUserAccessTokens: PropTypes.bool.isRequired,

        /**
         * Whether or not the experimental authentication transfer is enabled.
         */
        experimentalEnableAuthenticationTransfer: PropTypes.bool.isRequired,

        /*
         * Function to open password reset, takes user as an argument
         */
        doPasswordReset: PropTypes.func.isRequired,

        /*
         * Function to open email reset, takes user as an argument
         */
        doEmailReset: PropTypes.func.isRequired,

        /*
         * Function to open manage teams, takes user as an argument
         */
        doManageTeams: PropTypes.func.isRequired,

        /*
         * Function to open manage roles, takes user as an argument
         */
        doManageRoles: PropTypes.func.isRequired,

        /*
         * Function to open manage tokens, takes user as an argument
         */
        doManageTokens: PropTypes.func.isRequired,

        /*
         * The function to call when an error occurs
         */
        onError: PropTypes.func.isRequired,
        currentUser: PropTypes.object.isRequired,
        actions: PropTypes.shape({
            updateUserActive: PropTypes.func.isRequired,
            revokeAllSessions: PropTypes.func.isRequired,
        }).isRequired,
    };

    constructor(props) {
        super(props);

        this.state = {
            showDeactivateMemberModal: false,
            showRevokeSessionsModal: false,
            user: null,
            role: null,
        };
    }

    handleMakeActive = (e) => {
        e.preventDefault();
        this.props.actions.updateUserActive(this.props.user.id, true).
            then(this.onUpdateActiveResult);
    }

    handleManageTeams = (e) => {
        e.preventDefault();

        this.props.doManageTeams(this.props.user);
    }

    handleManageRoles = (e) => {
        e.preventDefault();

        this.props.doManageRoles(this.props.user);
    }

    handleManageTokens = (e) => {
        e.preventDefault();

        this.props.doManageTokens(this.props.user);
    }

    handleResetPassword = (e) => {
        e.preventDefault();
        this.props.doPasswordReset(this.props.user);
    }

    handleResetEmail = (e) => {
        e.preventDefault();
        this.props.doEmailReset(this.props.user);
    }

    handleResetMfa = (e) => {
        e.preventDefault();
        adminResetMfa(this.props.user.id, null, this.props.onError);
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
            this.props.onError({id: error.server_error_id, ...error});
        }
    }

    handleDeactivateCancel = () => {
        this.setState({showDeactivateMemberModal: false});
    }

    renderDeactivateMemberModal = () => {
        const user = this.props.user;

        const title = (
            <FormattedMessage
                id='deactivate_member_modal.title'
                defaultMessage='Deactivate {username}'
                values={{
                    username: this.props.user.username,
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

    handleShowRevokeSessionsModal = (e) => {
        e.preventDefault();
        this.setState({showRevokeSessionsModal: true});
    }

    handleRevokeSessions = () => {
        const me = this.props.currentUser;
        this.props.actions.revokeAllSessions(this.props.user.id).then(
            ({data, error}) => {
                if (data && this.props.user.id === me.id) {
                    emitUserLoggedOutEvent();
                } else if (error) {
                    this.props.onError(error);
                }
            }
        );

        this.setState({showRevokeSessionsModal: false});
    }

    handleRevokeSessionsCancel = () => {
        this.setState({showRevokeSessionsModal: false});
    }

    renderRevokeSessionsModal = () => {
        const title = (
            <FormattedMessage
                id='revoke_user_sessions_modal.title'
                defaultMessage='Revoke Sessions for {username}'
                values={{
                    username: this.props.user.username,
                }}
            />
        );

        const message = (
            <FormattedMessage
                id='revoke_user_sessions_modal.desc'
                defaultMessage='This action revokes all sessions for {username}. They will be logged out from all devices. Are you sure you want to revoke all sessions for {username}?'
                values={{
                    username: this.props.user.username,
                }}
            />
        );

        const revokeUserButtonButton = (
            <FormattedMessage
                id='revoke_user_sessions_modal.revoke'
                defaultMessage='Revoke'
            />
        );

        return (
            <ConfirmModal
                show={this.state.showRevokeSessionsModal}
                title={title}
                message={message}
                confirmButtonClass='btn btn-danger'
                confirmButtonText={revokeUserButtonButton}
                onConfirm={this.handleRevokeSessions}
                onCancel={this.handleRevokeSessionsCancel}
            />
        );
    }

    renderAccessToken = () => {
        const userAccessTokensEnabled = this.props.enableUserAccessTokens;
        if (!userAccessTokensEnabled) {
            return null;
        }

        const user = this.props.user;
        const hasPostAllRole = UserUtils.hasPostAllRole(user.roles);
        const hasPostAllPublicRole = UserUtils.hasPostAllPublicRole(user.roles);
        const hasUserAccessTokenRole = UserUtils.hasUserAccessTokenRole(user.roles);
        const isSystemAdmin = UserUtils.isSystemAdmin(user.roles);

        let messageId = '';
        if (hasUserAccessTokenRole || isSystemAdmin) {
            if (hasPostAllRole) {
                messageId = t('admin.user_item.userAccessTokenPostAll');
            } else if (hasPostAllPublicRole) {
                messageId = t('admin.user_item.userAccessTokenPostAllPublic');
            } else {
                messageId = t('admin.user_item.userAccessTokenYes');
            }
        }

        if (!messageId) {
            return null;
        }

        return (
            <div className='light margin-top half'>
                <FormattedMessage
                    key='admin.user_item.userAccessToken'
                    id={messageId}
                />
            </div>
        );
    }

    render() {
        const user = this.props.user;
        if (!user) {
            return <div/>;
        }

        let currentRoles = (
            <FormattedMessage
                id='admin.user_item.member'
                defaultMessage='Member'
            />
        );

        if (user.roles.length > 0 && Utils.isSystemAdmin(user.roles)) {
            currentRoles = (
                <FormattedMessage
                    id='team_members_dropdown.systemAdmin'
                    defaultMessage='System Admin'
                />
            );
        }

        let showMakeActive = false;
        let showMakeNotActive = !Utils.isSystemAdmin(user.roles);
        let showManageTeams = true;
        let showRevokeSessions = true;
        const showMfaReset = this.props.mfaEnabled && Boolean(user.mfa_active) && !user.is_bot;

        if (user.delete_at > 0) {
            currentRoles = (
                <FormattedMessage
                    id='admin.user_item.inactive'
                    defaultMessage='Inactive'
                />
            );
            showMakeActive = true;
            showMakeNotActive = false;
            showManageTeams = false;
            showRevokeSessions = false;
        }

        let disableActivationToggle = false;
        if (user.auth_service === Constants.LDAP_SERVICE) {
            disableActivationToggle = true;
        }

        const deactivateMemberModal = this.renderDeactivateMemberModal();
        const revokeSessionsModal = this.renderRevokeSessionsModal();

        return (
            <React.Fragment>
                {deactivateMemberModal}
                {revokeSessionsModal}
                <MenuWrapper>
                    <div className='text-right'>
                        <a>
                            <span>{currentRoles} </span>
                            <span className='caret'/>
                        </a>
                        {this.renderAccessToken()}
                    </div>
                    <div>
                        <Menu
                            openLeft={true}
                            ariaLabel={Utils.localizeMessage('admin.user_item.menuAriaLabel', 'User Actions Menu')}
                        >
                            <MenuItemAction
                                show={showMakeActive && !user.is_bot}
                                onClick={this.handleMakeActive}
                                text={Utils.localizeMessage('admin.user_item.makeActive', 'Activate')}
                                disabled={disableActivationToggle}
                            />
                            <MenuItemAction
                                show={showMakeNotActive && !user.is_bot}
                                onClick={this.handleShowDeactivateMemberModal}
                                text={Utils.localizeMessage('admin.user_item.makeInactive', 'Deactivate')}
                                disabled={disableActivationToggle}
                            />
                            <MenuItemAction
                                onClick={this.handleManageRoles}
                                text={Utils.localizeMessage('admin.user_item.manageRoles', 'Manage Roles')}
                            />
                            <MenuItemAction
                                show={showManageTeams}
                                onClick={this.handleManageTeams}
                                text={Utils.localizeMessage('admin.user_item.manageTeams', 'Manage Teams')}
                            />
                            <MenuItemAction
                                show={this.props.enableUserAccessTokens}
                                onClick={this.handleManageTokens}
                                text={Utils.localizeMessage('admin.user_item.manageTokens', 'Manage Tokens')}
                            />
                            <MenuItemAction
                                show={showMfaReset}
                                onClick={this.handleResetMfa}
                                text={Utils.localizeMessage('admin.user_item.resetMfa', 'Remove MFA')}
                            />
                            <MenuItemAction
                                show={Boolean(user.auth_service) && this.props.experimentalEnableAuthenticationTransfer && !user.is_bot}
                                onClick={this.handleResetPassword}
                                text={Utils.localizeMessage('admin.user_item.switchToEmail', 'Switch to Email/Password')}
                            />
                            <MenuItemAction
                                show={!user.auth_service && !user.is_bot}
                                onClick={this.handleResetPassword}
                                text={Utils.localizeMessage('admin.user_item.resetPwd', 'Reset Password')}
                            />
                            <MenuItemAction
                                show={!user.auth_service && !user.is_bot}
                                onClick={this.handleResetEmail}
                                text={Utils.localizeMessage('admin.user_item.resetEmail', 'Update Email')}
                            />
                            <SystemPermissionGate permissions={[Permissions.REVOKE_USER_ACCESS_TOKEN]}>
                                <MenuItemAction
                                    show={showRevokeSessions && !user.is_bot}
                                    onClick={this.handleShowRevokeSessionsModal}
                                    text={Utils.localizeMessage('admin.user_item.revokeSessions', 'Revoke Sessions')}
                                />
                            </SystemPermissionGate>
                        </Menu>
                    </div>
                </MenuWrapper>
            </React.Fragment>
        );
    }
}
