// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';

import {Constants} from 'utils/constants';
import * as Utils from 'utils/utils.jsx';
import ManageRolesModal from 'components/admin_console/manage_roles_modal';
import ManageTeamsModal from 'components/admin_console/manage_teams_modal';
import ManageTokensModal from 'components/admin_console/manage_tokens_modal';
import ResetPasswordModal from 'components/admin_console/reset_password_modal';
import ResetEmailModal from 'components/admin_console/reset_email_modal/reset_email_modal.jsx';
import SearchableUserList from 'components/searchable_user_list/searchable_user_list.jsx';
import UserListRowWithError from 'components/user_list_row_with_error';
import FormattedMarkdownMessage from 'components/formatted_markdown_message.jsx';

import SystemUsersDropdown from '../system_users_dropdown';

export default class SystemUsersList extends React.Component {
    static propTypes = {
        users: PropTypes.arrayOf(PropTypes.object),
        usersPerPage: PropTypes.number,
        total: PropTypes.number,
        nextPage: PropTypes.func,
        search: PropTypes.func.isRequired,
        focusOnMount: PropTypes.bool,
        renderFilterRow: PropTypes.func,

        teamId: PropTypes.string.isRequired,
        filter: PropTypes.string.isRequired,
        term: PropTypes.string.isRequired,
        onTermChange: PropTypes.func.isRequired,

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

        actions: PropTypes.shape({
            getUser: PropTypes.func.isRequired,
        }).isRequired,
    };

    constructor(props) {
        super(props);

        this.state = {
            page: 0,

            filter: props.filter,
            teamId: props.teamId,
            showManageTeamsModal: false,
            showManageRolesModal: false,
            showManageTokensModal: false,
            showPasswordModal: false,
            showEmailModal: false,
            user: null,
        };
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if (prevState.teamId !== nextProps.teamId || prevState.filter !== nextProps.filter) {
            return {
                page: 0,
                teamId: nextProps.teamId,
                filter: nextProps.filter,
            };
        }
        return null;
    }

    nextPage = () => {
        this.setState({page: this.state.page + 1});

        this.props.nextPage(this.state.page + 1);
    }

    previousPage = () => {
        this.setState({page: this.state.page - 1});
    }

    search = (term) => {
        this.props.search(term);

        if (term !== '') {
            this.setState({page: 0});
        }
    }

    doManageTeams = (user) => {
        this.setState({
            showManageTeamsModal: true,
            user,
        });
    }

    doManageRoles = (user) => {
        this.setState({
            showManageRolesModal: true,
            user,
        });
    }

    doManageTokens = (user) => {
        this.setState({
            showManageTokensModal: true,
            user,
        });
    }

    doManageTeamsDismiss = () => {
        this.setState({
            showManageTeamsModal: false,
            user: null,
        });
    }

    doManageRolesDismiss = () => {
        this.setState({
            showManageRolesModal: false,
            user: null,
        });
    }

    doManageTokensDismiss = () => {
        this.setState({
            showManageTokensModal: false,
            user: null,
        });
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

    doPasswordResetSubmit = (user) => {
        this.props.actions.getUser(user.id);

        this.setState({
            showPasswordModal: false,
            user: null,
        });
    }

    doEmailReset = (user) => {
        this.setState({
            showEmailModal: true,
            user,
        });
    }

    doEmailResetDismiss = () => {
        this.setState({
            showEmailModal: false,
            user: null,
        });
    }

    doEmailResetSubmit = (user) => {
        this.props.actions.getUser(user.id);

        this.setState({
            showEmailModal: false,
            user: null,
        });
    }

    getInfoForUser(user) {
        const info = [];

        if (user.auth_service) {
            let service;
            if (user.auth_service === Constants.LDAP_SERVICE || user.auth_service === Constants.SAML_SERVICE) {
                service = user.auth_service.toUpperCase();
            } else {
                service = Utils.toTitleCase(user.auth_service);
            }

            info.push(
                <FormattedMarkdownMessage
                    key='admin.user_item.authServiceNotEmail'
                    id='admin.user_item.authServiceNotEmail'
                    defaultMessage='**Sign-in Method:** {service}'
                    values={{
                        service,
                    }}
                />
            );
        } else {
            info.push(
                <FormattedMarkdownMessage
                    key='admin.user_item.authServiceEmail'
                    id='admin.user_item.authServiceEmail'
                    defaultMessage='**Sign-in Method:** Email'
                />
            );
        }

        info.push(', ');
        const userID = user.id;
        info.push(
            <FormattedMarkdownMessage
                key='admin.user_item.user_id'
                id='admin.user_item.user_id'
                defaultMessage='**User ID:** {userID}'
                values={{
                    userID,
                }}
            />
        );

        if (this.props.mfaEnabled) {
            info.push(', ');

            if (user.mfa_active) {
                info.push(
                    <FormattedMarkdownMessage
                        key='admin.user_item.mfaYes'
                        id='admin.user_item.mfaYes'
                        defaultMessage='**MFA**: Yes'
                    />
                );
            } else {
                info.push(
                    <FormattedMarkdownMessage
                        key='admin.user_item.mfaNo'
                        id='admin.user_item.mfaNo'
                        defaultMessage='**MFA**: No'
                    />
                );
            }
        }

        return info;
    }

    renderCount(count, total, startCount, endCount, isSearch) {
        if (total) {
            if (isSearch) {
                return (
                    <FormattedMessage
                        id='system_users_list.countSearch'
                        defaultMessage='{count, number} {count, plural, one {user} other {users}} of {total, number} total'
                        values={{
                            count,
                            total,
                        }}
                    />
                );
            } else if (startCount !== 0 || endCount !== total) {
                return (
                    <FormattedMessage
                        id='system_users_list.countPage'
                        defaultMessage='{startCount, number} - {endCount, number} {count, plural, one {user} other {users}} of {total, number} total'
                        values={{
                            count,
                            startCount: startCount + 1,
                            endCount,
                            total,
                        }}
                    />
                );
            }

            return (
                <FormattedMessage
                    id='system_users_list.count'
                    defaultMessage='{count, number} {count, plural, one {user} other {users}}'
                    values={{
                        count,
                    }}
                />
            );
        }

        return null;
    }

    render() {
        const extraInfo = {};
        if (this.props.users) {
            for (const user of this.props.users) {
                extraInfo[user.id] = this.getInfoForUser(user);
            }
        }

        return (
            <div>
                <SearchableUserList
                    {...this.props}
                    renderCount={this.renderCount}
                    extraInfo={extraInfo}
                    actions={[SystemUsersDropdown]}
                    actionProps={{
                        mfaEnabled: this.props.mfaEnabled,
                        enableUserAccessTokens: this.props.enableUserAccessTokens,
                        experimentalEnableAuthenticationTransfer: this.props.experimentalEnableAuthenticationTransfer,
                        doPasswordReset: this.doPasswordReset,
                        doEmailReset: this.doEmailReset,
                        doManageTeams: this.doManageTeams,
                        doManageRoles: this.doManageRoles,
                        doManageTokens: this.doManageTokens,
                    }}
                    nextPage={this.nextPage}
                    previousPage={this.previousPage}
                    search={this.search}
                    page={this.state.page}
                    term={this.props.term}
                    onTermChange={this.props.onTermChange}
                    rowComponentType={UserListRowWithError}
                />
                <ManageTeamsModal
                    user={this.state.user}
                    show={this.state.showManageTeamsModal}
                    onModalDismissed={this.doManageTeamsDismiss}
                />
                <ManageRolesModal
                    user={this.state.user}
                    show={this.state.showManageRolesModal}
                    onModalDismissed={this.doManageRolesDismiss}
                />
                <ManageTokensModal
                    user={this.state.user}
                    show={this.state.showManageTokensModal}
                    onModalDismissed={this.doManageTokensDismiss}
                />
                <ResetPasswordModal
                    user={this.state.user}
                    show={this.state.showPasswordModal}
                    onModalSubmit={this.doPasswordResetSubmit}
                    onModalDismissed={this.doPasswordResetDismiss}
                />
                <ResetEmailModal
                    user={this.state.user}
                    show={this.state.showEmailModal}
                    onModalSubmit={this.doEmailResetSubmit}
                    onModalDismissed={this.doEmailResetDismiss}
                />
            </div>
        );
    }
}
