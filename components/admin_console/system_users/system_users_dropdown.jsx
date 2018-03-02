// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';
import * as UserUtils from 'mattermost-redux/utils/user_utils';
import {Permissions} from 'mattermost-redux/constants';

import {adminResetMfa} from 'actions/admin_actions.jsx';
import {updateActive, revokeAllSessions} from 'actions/user_actions.jsx';
import TeamStore from 'stores/team_store.jsx';
import UserStore from 'stores/user_store.jsx';
import {Constants} from 'utils/constants.jsx';
import * as Utils from 'utils/utils.jsx';
import {clientLogout} from 'actions/global_actions.jsx';
import ConfirmModal from 'components/confirm_modal.jsx';
import SystemPermissionGate from 'components/permissions_gates/system_permission_gate';

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
    };

    constructor(props) {
        super(props);

        this.state = {
            showDemoteModal: false,
            showDeactivateMemberModal: false,
            showRevokeSessionsModal: false,
            user: null,
            role: null,
        };
    }

    handleMakeActive = (e) => {
        e.preventDefault();
        updateActive(this.props.user.id, true, null, this.props.onError);
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

    handleResetMfa = (e) => {
        e.preventDefault();
        adminResetMfa(this.props.user.id, null, this.props.onError);
    }

    handleDemoteSystemAdmin = (user, role) => {
        this.setState({
            showDemoteModal: true,
            user,
            role,
        });
    }

    handleDemoteCancel = () => {
        this.setState({
            showDemoteModal: false,
            user: null,
            role: null,
        });
        this.props.onError(null);
    }

    handleDemoteSubmit = () => {
        if (this.state.role === 'member') {
            this.doMakeMember();
        }

        const teamUrl = TeamStore.getCurrentTeamUrl();
        if (teamUrl) {
            // the channel is added to the URL cause endless loading not being fully fixed
            window.location.href = teamUrl + `/channels/${Constants.DEFAULT_CHANNEL}`;
        } else {
            window.location.href = '/';
        }
    }

    handleShowDeactivateMemberModal = (e) => {
        e.preventDefault();
        this.setState({showDeactivateMemberModal: true});
    }

    handleDeactivateMember = () => {
        updateActive(this.props.user.id, false, null, this.props.onError);
        this.setState({showDeactivateMemberModal: false});
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
        const me = UserStore.getCurrentUser();
        revokeAllSessions(this.props.user.id,
            () => {
                if (this.props.user.id === me.id) {
                    clientLogout();
                }
            },
            this.props.onError
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
                messageId = 'admin.user_item.userAccessTokenPostAll';
            } else if (hasPostAllPublicRole) {
                messageId = 'admin.user_item.userAccessTokenPostAllPublic';
            } else {
                messageId = 'admin.user_item.userAccessTokenYes';
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

        const me = UserStore.getCurrentUser();
        let showMakeActive = false;
        let showMakeNotActive = !Utils.isSystemAdmin(user.roles);
        let showManageTeams = true;
        let showRevokeSessions = true;
        const showMfaReset = this.props.mfaEnabled && user.mfa_active;

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

        let menuClass = '';
        if (disableActivationToggle) {
            menuClass = 'disabled';
        }

        let makeActive = null;
        if (showMakeActive) {
            makeActive = (
                <li
                    role='presentation'
                    className={menuClass}
                >
                    <a
                        id='activate'
                        role='menuitem'
                        href='#'
                        onClick={this.handleMakeActive}
                    >
                        <FormattedMessage
                            id='admin.user_item.makeActive'
                            defaultMessage='Activate'
                        />
                    </a>
                </li>
            );
        }

        let makeNotActive = null;
        if (showMakeNotActive) {
            makeNotActive = (
                <li
                    role='presentation'
                    className={menuClass}
                >
                    <a
                        id='deactivate'
                        role='menuitem'
                        href='#'
                        onClick={this.handleShowDeactivateMemberModal}
                    >
                        <FormattedMessage
                            id='admin.user_item.makeInactive'
                            defaultMessage='Deactivate'
                        />
                    </a>
                </li>
            );
        }

        let manageTeams = null;
        if (showManageTeams) {
            manageTeams = (
                <li role='presentation'>
                    <a
                        id='manageTeams'
                        role='menuitem'
                        href='#'
                        onClick={this.handleManageTeams}
                    >
                        <FormattedMessage
                            id='admin.user_item.manageTeams'
                            defaultMessage='Manage Teams'
                        />
                    </a>
                </li>
            );
        }

        let mfaReset = null;
        if (showMfaReset) {
            mfaReset = (
                <li role='presentation'>
                    <a
                        id='removeMFA'
                        role='menuitem'
                        href='#'
                        onClick={this.handleResetMfa}
                    >
                        <FormattedMessage
                            id='admin.user_item.resetMfa'
                            defaultMessage='Remove MFA'
                        />
                    </a>
                </li>
            );
        }

        let passwordReset;
        if (user.auth_service) {
            if (this.props.experimentalEnableAuthenticationTransfer) {
                passwordReset = (
                    <li role='presentation'>
                        <a
                            id='switchEmailPassword'
                            role='menuitem'
                            href='#'
                            onClick={this.handleResetPassword}
                        >
                            <FormattedMessage
                                id='admin.user_item.switchToEmail'
                                defaultMessage='Switch to Email/Password'
                            />
                        </a>
                    </li>
                );
            }
        } else {
            passwordReset = (
                <li role='presentation'>
                    <a
                        id='resetPassword'
                        role='menuitem'
                        href='#'
                        onClick={this.handleResetPassword}
                    >
                        <FormattedMessage
                            id='admin.user_item.resetPwd'
                            defaultMessage='Reset Password'
                        />
                    </a>
                </li>
            );
        }

        let revokeSessions;
        if (showRevokeSessions) {
            revokeSessions = (
                <SystemPermissionGate permissions={[Permissions.REVOKE_USER_ACCESS_TOKEN]}>
                    <li role='presentation'>
                        <a
                            id='revokeSessions'
                            role='menuItem'
                            href='#'
                            onClick={this.handleShowRevokeSessionsModal}
                        >
                            <FormattedMessage
                                id='admin.user_item.revokeSessions'
                                defaultMessage='Revoke Sessions'
                            />
                        </a>
                    </li>
                </SystemPermissionGate>
            );
        }

        let manageTokens;
        if (this.props.enableUserAccessTokens) {
            manageTokens = (
                <li role='presentation'>
                    <a
                        id='manageTokens'
                        role='menuitem'
                        href='#'
                        onClick={this.handleManageTokens}
                    >
                        <FormattedMessage
                            id='admin.user_item.manageTokens'
                            defaultMessage='Manage Tokens'
                        />
                    </a>
                </li>
            );
        }

        let makeDemoteModal = null;
        if (this.props.user.id === me.id) {
            const title = (
                <FormattedMessage
                    id='admin.user_item.confirmDemoteRoleTitle'
                    defaultMessage='Confirm demotion from System Admin role'
                />
            );

            const message = (
                <div>
                    <FormattedMessage
                        id='admin.user_item.confirmDemoteDescription'
                        defaultMessage="If you demote yourself from the System Admin role and there is not another user with System Admin privileges, you'll need to re-assign a System Admin by accessing the Mattermost server through a terminal and running the following command."
                    />
                    <br/>
                    <br/>
                    <FormattedMessage
                        id='admin.user_item.confirmDemotionCmd'
                        defaultMessage='platform roles system_admin {username}'
                        values={{
                            username: me.username,
                        }}
                    />
                </div>
            );

            const confirmButton = (
                <FormattedMessage
                    id='admin.user_item.confirmDemotion'
                    defaultMessage='Confirm Demotion'
                />
            );

            makeDemoteModal = (
                <ConfirmModal
                    show={this.state.showDemoteModal}
                    title={title}
                    message={message}
                    confirmButtonText={confirmButton}
                    onConfirm={this.handleDemoteSubmit}
                    onCancel={this.handleDemoteCancel}
                />
            );
        }

        const deactivateMemberModal = this.renderDeactivateMemberModal();
        const revokeSessionsModal = this.renderRevokeSessionsModal();

        return (
            <div className='dropdown member-drop text-right'>
                <a
                    id='memberDropdown'
                    href='#'
                    className='dropdown-toggle theme'
                    type='button'
                    data-toggle='dropdown'
                    aria-expanded='true'
                >
                    <span>{currentRoles} </span>
                    <span className='caret'/>
                </a>
                {this.renderAccessToken()}
                <ul
                    className='dropdown-menu member-menu'
                    role='menu'
                >
                    {makeActive}
                    {makeNotActive}
                    <li role='presentation'>
                        <a
                            id='manageRoles'
                            role='menuitem'
                            href='#'
                            onClick={this.handleManageRoles}
                        >
                            <FormattedMessage
                                id='admin.user_item.manageRoles'
                                defaultMessage='Manage Roles'
                            />
                        </a>
                    </li>
                    {manageTeams}
                    {manageTokens}
                    {mfaReset}
                    {passwordReset}
                    {revokeSessions}
                </ul>
                {makeDemoteModal}
                {deactivateMemberModal}
                {revokeSessionsModal}
            </div>
        );
    }
}
