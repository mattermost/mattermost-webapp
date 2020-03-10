// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {Redirect} from 'react-router-dom';
import {FormattedMessage} from 'react-intl';
import {Overlay, Tooltip} from 'react-bootstrap';

import {isEmail} from 'mattermost-redux/utils/helpers';

import {adminResetMfa, adminResetEmail} from 'actions/admin_actions.jsx';

import {Constants} from 'utils/constants';
import * as Utils from 'utils/utils.jsx';
import {t} from 'utils/i18n';

import BlockableLink from 'components/admin_console/blockable_link';
import ResetPasswordModal from 'components/admin_console/reset_password_modal';
import AdminButtonOutline from 'components/admin_console/admin_button_outline/admin_button_outline';
import AdminUserCard from 'components/admin_console/admin_user_card/admin_user_card';
import AdminPanel from 'components/widgets/admin_console/admin_panel';
import ConfirmModal from 'components/confirm_modal';
import SaveButton from 'components/save_button';
import FormError from 'components/form_error';
import TeamSelectorModal from 'components/team_selector_modal';

import TeamList from 'components/admin_console/system_user_detail/team_list';
import EmailIcon from 'components/widgets/icons/email_icon.jsx';
import AtIcon from 'components/widgets/icons/at_icon.jsx';
import SheidOutlineIcon from 'components/widgets/icons/shield_outline_icon.jsx';

import './system_user_detail.scss';

export default class SystemUserDetail extends React.PureComponent {
    static propTypes = {
        user: PropTypes.object.isRequired,
        mfaEnabled: PropTypes.bool.isRequired,
        actions: PropTypes.shape({
            updateUserActive: PropTypes.func.isRequired,
            setNavigationBlocked: PropTypes.func.isRequired,
            addUserToTeam: PropTypes.func.isRequired,
        }).isRequired,
    }

    static defaultProps = {
        user: {
            email: null,
        },
        mfaEnabled: false,
    }

    constructor(props) {
        super(props);
        this.state = {
            teams: null,
            teamIds: null,
            loading: false,
            searching: false,
            showPasswordModal: false,
            showDeactivateMemberModal: false,
            saveNeeded: false,
            saving: false,
            serverError: null,
            errorTooltip: false,
            customComponentWrapperClass: '',
            user: {
                email: this.props.user.email,
            },
            addTeamOpen: false,
            refreshTeams: true,
        };
    }

    setTeamsData = (teams) => {
        const teamIds = teams.map((team) => team.team_id);
        this.setState({teams});
        this.setState({teamIds});
        this.setState({refreshTeams: false});
    }

    openAddTeam = () => {
        this.setState({addTeamOpen: true});
    }

    addTeams = (teams) => {
        const promises = [];
        for (const team of teams) {
            promises.push(this.props.actions.addUserToTeam(team.id, this.props.user.id));
        }
        Promise.all(promises).finally(this.setState({refreshTeams: true}));
    }

    closeAddTeam = () => {
        this.setState({addTeamOpen: false});
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
        });
    }

    doPasswordResetSubmit = () => {
        this.setState({
            showPasswordModal: false,
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
            this.setState({error});
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

    handleEmailChange = (e) => {
        const emailChanged = e.target.value !== this.props.user.email;
        this.setState({
            user: {
                email: e.target.value,
            },
            saveNeeded: emailChanged,
        });
        this.props.actions.setNavigationBlocked(emailChanged);
    }

    handleSubmit = (e) => {
        e.preventDefault();
        if (this.state.user.email !== this.props.user.email) {
            if (!isEmail(this.state.user.email)) {
                this.setState({serverError: 'Invalid Email address'});
                return;
            }
            const user = Object.assign({}, this.props.user);
            const email = this.state.user.email.trim().toLowerCase();
            user.email = email;

            this.setState({serverError: null});

            adminResetEmail(
                user,
                () => {
                    this.props.history.push('/admin_console/user_management/users');
                },
                (err) => {
                    const serverError = err.message ? err.message : err;
                    this.setState({serverError});
                }
            );

            this.setState({
                saving: false,
                saveNeeded: false,
                serverError: null,
            });
            this.props.actions.setNavigationBlocked(false);
        }
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
                <AdminButtonOutline
                    onClick={this.handleMakeActive}
                    className='admin-btn-default'
                >
                    {Utils.localizeMessage('admin.user_item.makeActive', 'Activate')}
                </AdminButtonOutline>
            );
        }
        return (
            <AdminButtonOutline
                onClick={this.handleShowDeactivateMemberModal}
                className='admin-btn-default'
            >
                {Utils.localizeMessage('admin.user_item.makeInactive', 'Deactivate')}
            </AdminButtonOutline>
        );
    }

    renderRemoveMFA = () => {
        if (this.props.user.mfa_active) {
            return (
                <AdminButtonOutline
                    onClick={this.handleResetMfa}
                    className='admin-btn-default'
                >
                    {Utils.localizeMessage('admin.user_item.resetMfa', 'Remove MFA')}
                </AdminButtonOutline>
            );
        }
        return null;
    }

    getAuthenticationText() {
        const {user, mfaEnabled} = this.props;
        let authLine;

        if (user.auth_service) {
            let service;
            if (user.auth_service === Constants.LDAP_SERVICE || user.auth_service === Constants.SAML_SERVICE) {
                service = user.auth_service.toUpperCase();
            } else {
                service = Utils.toTitleCase(user.auth_service);
            }
            authLine = service;
        } else {
            authLine = Utils.localizeMessage('admin.userManagement.userDetail.email', 'Email');
        }
        if (mfaEnabled) {
            if (user.mfa_active) {
                authLine += ', ';
                authLine += Utils.localizeMessage('admin.userManagement.userDetail.mfa', 'MFA');
            }
        }
        return authLine;
    }

    render() {
        const {user} = this.props;
        let deactivateMemberModal;
        let currentRoles = (
            <FormattedMessage
                id='admin.user_item.member'
                defaultMessage='Member'
            />
        );

        if (!user.id) {
            return (
                <Redirect to={{pathname: '/admin_console/user_management/users'}}/>
            );
        }

        if (user.id) {
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
            if (user.roles.length > 0 && Utils.isGuest(user)) {
                currentRoles = (
                    <FormattedMessage
                        id='team_members_dropdown.guest'
                        defaultMessage='Guest'
                    />
                );
            }
        }

        return (
            <div className='SystemUserDetail wrapper--fixed'>
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
                        <AdminUserCard
                            user={user}
                            body={
                                <React.Fragment>
                                    <span className='SystemUserDetail__position'>{user.position}</span>
                                    <span className='SystemUserDetail__field-label'>{Utils.localizeMessage('admin.userManagement.userDetail.email', 'Email')}</span>
                                    <div>
                                        <EmailIcon className='SystemUserDetail__field-icon'/>
                                        <input
                                            className='SystemUserDetail__input form-control'
                                            type='text'
                                            value={this.state.user.email}
                                            onChange={this.handleEmailChange}
                                        />
                                    </div>
                                    <span className='SystemUserDetail__field-label'>{Utils.localizeMessage('admin.userManagement.userDetail.username', 'Username')}</span>
                                    <div>
                                        <AtIcon className='SystemUserDetail__field-icon'/>
                                        <span className='SystemUserDetail__field-text'>{user.username}</span>
                                    </div>
                                    <span className='SystemUserDetail__field-label'>{Utils.localizeMessage('admin.userManagement.userDetail.authenticationMethod', 'Authentication Method')}</span>
                                    <div className='SystemUserDetail__field-text'>
                                        <SheidOutlineIcon className='SystemUserDetail__field-icon'/>
                                        <span className='SystemUserDetail__field-text'>{this.getAuthenticationText()}</span>
                                    </div>

                                    <span className='SystemUserDetail__field-label'>{Utils.localizeMessage('admin.userManagement.userDetail.role', 'Role')}</span>
                                    <p>{currentRoles}</p>
                                </React.Fragment>
                            }
                            footer={
                                <React.Fragment>
                                    <AdminButtonOutline
                                        onClick={this.doPasswordReset}
                                        className='admin-btn-default'
                                    >
                                        {Utils.localizeMessage('admin.user_item.resetPwd', 'Reset Password')}
                                    </AdminButtonOutline>
                                    {this.renderActivateDeactivate()}
                                    {this.renderRemoveMFA()}
                                </React.Fragment>
                            }
                        />
                        <AdminPanel
                            subtitleId={t('admin.userManagement.userDetail.teamsSubtitle')}
                            subtitleDefault={'Teams to which this user belongs'}
                            titleId={t('admin.userManagement.userDetail.teamsTitle')}
                            titleDefault={'Team Membership'}
                            button={(
                                <div className='add-team-button'>
                                    <button
                                        className='btn btn-primary'
                                        onClick={this.openAddTeam}
                                    >
                                        <FormattedMessage
                                            id='admin.userManagement.userDetail.addTeam'
                                            defaultMessage='Add Team'
                                        />
                                    </button>
                                </div>
                            )}
                        >
                            <TeamList
                                userId={this.props.user.id}
                                userDetailCallback={this.setTeamsData}
                                refreshTeams={this.state.refreshTeams}
                            />
                        </AdminPanel>
                    </div>
                </div>
                <div className='admin-console-save'>
                    <SaveButton
                        saving={this.state.saving}
                        disabled={!this.state.saveNeeded || (this.canSave && !this.canSave())}
                        onClick={this.handleSubmit}
                        savingMessage={Utils.localizeMessage('admin.saving', 'Saving Config...')}
                    />
                    <div
                        className='error-message'
                        ref='errorMessage'
                        onMouseOver={this.openTooltip}
                        onMouseOut={this.closeTooltip}
                    >
                        <FormError error={this.state.serverError}/>
                    </div>
                    <Overlay
                        show={this.state.errorTooltip}
                        delayShow={Constants.OVERLAY_TIME_DELAY}
                        placement='top'
                        target={this.refs.errorMessage}
                    >
                        <Tooltip id='error-tooltip' >
                            {this.state.serverError}
                        </Tooltip>
                    </Overlay>
                </div>
                <ResetPasswordModal
                    user={user}
                    show={this.state.showPasswordModal}
                    onModalSubmit={this.doPasswordResetSubmit}
                    onModalDismissed={this.doPasswordResetDismiss}
                />
                {deactivateMemberModal}
                {this.state.addTeamOpen &&
                    <TeamSelectorModal
                        onModalDismissed={this.closeAddTeam}
                        onTeamsSelected={this.addTeams}
                        alreadySelected={this.state.teamIds}
                    />
                }
            </div>
        );
    }
}
