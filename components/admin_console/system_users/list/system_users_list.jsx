// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedHTMLMessage, FormattedMessage} from 'react-intl';

import {Constants} from 'utils/constants.jsx';
import * as Utils from 'utils/utils.jsx';
import ManageRolesModal from 'components/admin_console/manage_roles_modal';
import ManageTeamsModal from 'components/admin_console/manage_teams_modal/manage_teams_modal.jsx';
import ManageTokensModal from 'components/admin_console/manage_tokens_modal';
import ResetPasswordModal from 'components/admin_console/reset_password_modal';
import SearchableUserList from 'components/searchable_user_list/searchable_user_list.jsx';
import UserListRowWithError from 'components/user_list_row_with_error.jsx';

import SystemUsersDropdown from '../system_users_dropdown.jsx';

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

            showManageTeamsModal: false,
            showManageRolesModal: false,
            showManageTokensModal: false,
            showPasswordModal: false,
            user: null,
        };
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.teamId !== this.props.teamId) {
            this.setState({page: 0});
        }
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
                <FormattedHTMLMessage
                    key='admin.user_item.authServiceNotEmail'
                    id='admin.user_item.authServiceNotEmail'
                    defaultMessage='<strong>Sign-in Method:</strong> {service}'
                    values={{
                        service,
                    }}
                />
            );
        } else {
            info.push(
                <FormattedHTMLMessage
                    key='admin.user_item.authServiceEmail'
                    id='admin.user_item.authServiceEmail'
                    defaultMessage='<strong>Sign-in Method:</strong> Email'
                />
            );
        }

        if (this.props.mfaEnabled) {
            info.push(', ');

            if (user.mfa_active) {
                info.push(
                    <FormattedHTMLMessage
                        key='admin.user_item.mfaYes'
                        id='admin.user_item.mfaYes'
                        defaultMessage='<strong>MFA</strong>: Yes'
                    />
                );
            } else {
                info.push(
                    <FormattedHTMLMessage
                        key='admin.user_item.mfaNo'
                        id='admin.user_item.mfaNo'
                        defaultMessage='<strong>MFA</strong>: No'
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
            </div>
        );
    }
}
