// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {defineMessages, FormattedDate, FormattedMessage, FormattedTime, injectIntl, IntlShape} from 'react-intl';
import {UserProfile} from 'mattermost-redux/types/users';
import {ActionFunc} from 'mattermost-redux/types/actions';
import {Audit} from 'mattermost-redux/types/audits';
import {Channel} from 'mattermost-redux/types/channels';

import {t} from 'utils/i18n';
import {isSystemAdmin, toTitleCase} from 'utils/utils.jsx';

const holders = defineMessages({
    sessionRevoked: {
        id: t('audit_table.sessionRevoked'),
        defaultMessage: 'The session with id {sessionId} was revoked',
    },
    channelCreated: {
        id: t('audit_table.channelCreated'),
        defaultMessage: 'Created the {channelName} channel',
    },
    establishedDM: {
        id: t('audit_table.establishedDM'),
        defaultMessage: 'Established a direct message channel with {username}',
    },
    nameUpdated: {
        id: t('audit_table.nameUpdated'),
        defaultMessage: 'Updated the {channelName} channel name',
    },
    headerUpdated: {
        id: t('audit_table.headerUpdated'),
        defaultMessage: 'Updated the {channelName} channel header',
    },
    channelDeleted: {
        id: t('audit_table.channelDeleted'),
        defaultMessage: 'Archived the channel with the URL {url}',
    },
    userAdded: {
        id: t('audit_table.userAdded'),
        defaultMessage: 'Added {username} to the {channelName} channel',
    },
    userRemoved: {
        id: t('audit_table.userRemoved'),
        defaultMessage: 'Removed {username} to the {channelName} channel',
    },
    attemptedRegisterApp: {
        id: t('audit_table.attemptedRegisterApp'),
        defaultMessage: 'Attempted to register a new OAuth Application with ID {id}',
    },
    attemptedAllowOAuthAccess: {
        id: t('audit_table.attemptedAllowOAuthAccess'),
        defaultMessage: 'Attempted to allow a new OAuth service access',
    },
    successfullOAuthAccess: {
        id: t('audit_table.successfullOAuthAccess'),
        defaultMessage: 'Successfully gave a new OAuth service access',
    },
    failedOAuthAccess: {
        id: t('audit_table.failedOAuthAccess'),
        defaultMessage: 'Failed to allow a new OAuth service access - the redirect URI did not match the previously registered callback',
    },
    attemptedOAuthToken: {
        id: t('audit_table.attemptedOAuthToken'),
        defaultMessage: 'Attempted to get an OAuth access token',
    },
    successfullOAuthToken: {
        id: t('audit_table.successfullOAuthToken'),
        defaultMessage: 'Successfully added a new OAuth service',
    },
    oauthTokenFailed: {
        id: t('audit_table.oauthTokenFailed'),
        defaultMessage: 'Failed to get an OAuth access token - {token}',
    },
    attemptedLogin: {
        id: t('audit_table.attemptedLogin'),
        defaultMessage: 'Attempted to login',
    },
    authenticated: {
        id: t('audit_table.authenticated'),
        defaultMessage: 'Successfully authenticated',
    },
    successfullLogin: {
        id: t('audit_table.successfullLogin'),
        defaultMessage: 'Successfully logged in',
    },
    failedLogin: {
        id: t('audit_table.failedLogin'),
        defaultMessage: 'FAILED login attempt',
    },
    updatePicture: {
        id: t('audit_table.updatePicture'),
        defaultMessage: 'Updated your profile picture',
    },
    updateGeneral: {
        id: t('audit_table.updateGeneral'),
        defaultMessage: 'Updated the general settings of your account',
    },
    attemptedPassword: {
        id: t('audit_table.attemptedPassword'),
        defaultMessage: 'Attempted to change password',
    },
    successfullPassword: {
        id: t('audit_table.successfullPassword'),
        defaultMessage: 'Successfully changed password',
    },
    failedPassword: {
        id: t('audit_table.failedPassword'),
        defaultMessage: 'Failed to change password - tried to update user password who was logged in through OAuth',
    },
    updatedRol: {
        id: t('audit_table.updatedRol'),
        defaultMessage: 'Updated user role(s) to ',
    },
    member: {
        id: t('audit_table.member'),
        defaultMessage: 'member',
    },
    accountActive: {
        id: t('audit_table.accountActive'),
        defaultMessage: 'Account activated',
    },
    accountInactive: {
        id: t('audit_table.accountInactive'),
        defaultMessage: 'Account deactivated',
    },
    by: {
        id: t('audit_table.by'),
        defaultMessage: ' by {username}',
    },
    byAdmin: {
        id: t('audit_table.byAdmin'),
        defaultMessage: ' by an admin',
    },
    sentEmail: {
        id: t('audit_table.sentEmail'),
        defaultMessage: 'Sent an email to {email} to reset your password',
    },
    attemptedReset: {
        id: t('audit_table.attemptedReset'),
        defaultMessage: 'Attempted to reset password',
    },
    successfullReset: {
        id: t('audit_table.successfullReset'),
        defaultMessage: 'Successfully reset password',
    },
    updateGlobalNotifications: {
        id: t('audit_table.updateGlobalNotifications'),
        defaultMessage: 'Updated your global notification settings',
    },
    attemptedWebhookCreate: {
        id: t('audit_table.attemptedWebhookCreate'),
        defaultMessage: 'Attempted to create a webhook',
    },
    succcessfullWebhookCreate: {
        id: t('audit_table.successfullWebhookCreate'),
        defaultMessage: 'Successfully created a webhook',
    },
    failedWebhookCreate: {
        id: t('audit_table.failedWebhookCreate'),
        defaultMessage: 'Failed to create a webhook - bad channel permissions',
    },
    attemptedWebhookDelete: {
        id: t('audit_table.attemptedWebhookDelete'),
        defaultMessage: 'Attempted to delete a webhook',
    },
    successfullWebhookDelete: {
        id: t('audit_table.successfullWebhookDelete'),
        defaultMessage: 'Successfully deleted a webhook',
    },
    failedWebhookDelete: {
        id: t('audit_table.failedWebhookDelete'),
        defaultMessage: 'Failed to delete a webhook - inappropriate conditions',
    },
    logout: {
        id: t('audit_table.logout'),
        defaultMessage: 'Logged out of your account',
    },
    verified: {
        id: t('audit_table.verified'),
        defaultMessage: 'Successfully verified your email address',
    },
    revokedAll: {
        id: t('audit_table.revokedAll'),
        defaultMessage: 'Revoked all current sessions for the team',
    },
    loginAttempt: {
        id: t('audit_table.loginAttempt'),
        defaultMessage: ' (Login attempt)',
    },
    loginFailure: {
        id: t('audit_table.loginFailure'),
        defaultMessage: ' (Login failure)',
    },
    attemptedLicenseAdd: {
        id: t('audit_table.attemptedLicenseAdd'),
        defaultMessage: 'Attempted to add new license',
    },
    successfullLicenseAdd: {
        id: t('audit_table.successfullLicenseAdd'),
        defaultMessage: 'Successfully added new license',
    },
    failedExpiredLicenseAdd: {
        id: t('audit_table.failedExpiredLicenseAdd'),
        defaultMessage: 'Failed to add a new license as it has either expired or not yet been started',
    },
    failedInvalidLicenseAdd: {
        id: t('audit_table.failedInvalidLicenseAdd'),
        defaultMessage: 'Failed to add an invalid license',
    },
    licenseRemoved: {
        id: t('audit_table.licenseRemoved'),
        defaultMessage: 'Successfully removed a license',
    },
});

type Props = {
    intl: IntlShape;
    audits: Audit[];
    showUserId?: boolean;
    showIp?: boolean;
    showSession?: boolean;
    currentUser: UserProfile;
    getUser: (userId: string) => UserProfile;
    getByName: (channelURL: string) => Channel | null | undefined
    actions: {
        getMissingProfilesByIds: (userIds: string[]) => ActionFunc;
    }
    getDirectTeammate: (channelId: string) => any;
};

type AuditInfo = {
    userId: string;
    desc: string;
    ip: string;
    sessionId: string;
    timestamp: JSX.Element;
};

export class AuditTable extends React.PureComponent<Props> {
    componentDidMount() {
        const ids = this.props.audits.map((audit) => audit.user_id);
        this.props.actions.getMissingProfilesByIds(ids);
    }

    render() {
        const {audits, showUserId, showIp, showSession} = this.props;
        const accessList = [];

        for (const [i, audit] of audits.entries()) {
            const auditInfo = this.formatAuditInfo(audit);

            let uContent;
            if (showUserId) {
                uContent = <td className='word-break--all'>{auditInfo.userId}</td>;
            }

            let iContent;
            if (showIp) {
                iContent = <td className='whitespace--nowrap word-break--all'>{auditInfo.ip}</td>;
            }

            let sContent;
            if (showSession) {
                sContent = <td className='whitespace--nowrap word-break--all'>{auditInfo.sessionId}</td>;
            }

            let descStyle = '';
            if (auditInfo.desc.toLowerCase().indexOf('fail') !== -1) {
                descStyle = ' color--error';
            }

            accessList[i] = (
                <tr key={audit.id}>
                    <td className='whitespace--nowrap word-break--all'>{auditInfo.timestamp}</td>
                    {uContent}
                    <td
                        className={'word-break--all' + descStyle}
                    >
                        {auditInfo.desc}
                    </td>
                    {iContent}
                    {sContent}
                </tr>
            );
        }

        let userIdContent;
        if (showUserId) {
            userIdContent = (
                <th>
                    <FormattedMessage
                        id='audit_table.userId'
                        defaultMessage='User ID'
                    />
                </th>
            );
        }

        let ipContent;
        if (showIp) {
            ipContent = (
                <th>
                    <FormattedMessage
                        id='audit_table.ip'
                        defaultMessage='IP Address'
                    />
                </th>
            );
        }

        let sessionContent;
        if (showSession) {
            sessionContent = (
                <th>
                    <FormattedMessage
                        id='audit_table.session'
                        defaultMessage='Session ID'
                    />
                </th>
            );
        }

        return (
            <table className='table'>
                <thead>
                    <tr>
                        <th>
                            <FormattedMessage
                                id='audit_table.timestamp'
                                defaultMessage='Timestamp'
                            />
                        </th>
                        {userIdContent}
                        <th>
                            <FormattedMessage
                                id='audit_table.action'
                                defaultMessage='Action'
                            />
                        </th>
                        {ipContent}
                        {sessionContent}
                    </tr>
                </thead>
                <tbody data-testid='auditTableBody'>
                    {accessList}
                </tbody>
            </table>
        );
    }

    formatAuditInfo(audit: Audit): AuditInfo {
        const {formatMessage} = this.props.intl;
        const actionURL = audit.action.replace(/\/api\/v[1-9]/, '');
        let auditDesc = '';

        if (actionURL.indexOf('/channels') === 0) {
            const channelInfo = audit.extra_info.split(' ');
            const channelNameField = channelInfo[0].split('=');

            let channelURL = '';
            let channelObj;
            let channelName = '';
            if (channelNameField.indexOf('name') >= 0) {
                channelURL = channelNameField[channelNameField.indexOf('name') + 1];
                channelObj = this.props.getByName(channelURL);
                if (channelObj) {
                    channelName = channelObj.display_name;
                } else {
                    channelName = channelURL;
                }
            }

            switch (actionURL) {
            case '/channels/create':
                auditDesc = formatMessage(holders.channelCreated, {channelName});
                break;
            case '/channels/create_direct':
                if (channelObj) {
                    auditDesc = formatMessage(holders.establishedDM, {username: this.props.getDirectTeammate(channelObj.id).username});
                }
                break;
            case '/channels/update':
                auditDesc = formatMessage(holders.nameUpdated, {channelName});
                break;
            case '/channels/update_desc': // support the old path
            case '/channels/update_header':
                auditDesc = formatMessage(holders.headerUpdated, {channelName});
                break;
            default: {
                let userIdField = [];
                let userId = '';
                let username = '';

                if (channelInfo[1]) {
                    userIdField = channelInfo[1].split('=');

                    if (userIdField.indexOf('user_id') >= 0) {
                        userId = userIdField[userIdField.indexOf('user_id') + 1];
                        const profile = this.props.getUser(userId);
                        if (profile) {
                            username = profile.username;
                        }
                    }
                }

                if ((/\/channels\/[A-Za-z0-9]+\/delete/).test(actionURL)) {
                    auditDesc = formatMessage(holders.channelDeleted, {url: channelURL});
                } else if ((/\/channels\/[A-Za-z0-9]+\/add/).test(actionURL)) {
                    auditDesc = formatMessage(holders.userAdded, {username, channelName});
                } else if ((/\/channels\/[A-Za-z0-9]+\/remove/).test(actionURL)) {
                    auditDesc = formatMessage(holders.userRemoved, {username, channelName});
                }

                break;
            }
            }
        } else if (actionURL.indexOf('/oauth') === 0) {
            const oauthInfo = audit.extra_info.split(' ');

            switch (actionURL) {
            case '/oauth/register': {
                const clientIdField = oauthInfo[0].split('=');

                if (clientIdField[0] === 'client_id') {
                    auditDesc = formatMessage(holders.attemptedRegisterApp, {id: clientIdField[1]});
                }

                break;
            }
            case '/oauth/allow':
                if (oauthInfo[0] === 'attempt') {
                    auditDesc = formatMessage(holders.attemptedAllowOAuthAccess);
                } else if (oauthInfo[0] === 'success') {
                    auditDesc = formatMessage(holders.successfullOAuthAccess);
                } else if (oauthInfo[0] === 'fail - redirect_uri did not match registered callback') {
                    auditDesc = formatMessage(holders.failedOAuthAccess);
                }

                break;
            case '/oauth/access_token':
                if (oauthInfo[0] === 'attempt') {
                    auditDesc = formatMessage(holders.attemptedOAuthToken);
                } else if (oauthInfo[0] === 'success') {
                    auditDesc = formatMessage(holders.successfullOAuthToken);
                } else {
                    const oauthTokenFailure = oauthInfo[0].split('-');

                    if (oauthTokenFailure[0].trim() === 'fail' && oauthTokenFailure[1]) {
                        auditDesc = formatMessage(holders.oauthTokenFailed, {token: oauthTokenFailure[1].trim()});
                    }
                }

                break;
            default:
                break;
            }
        } else if (actionURL.indexOf('/users') === 0) {
            const userInfo = audit.extra_info.split(' ');

            switch (actionURL) {
            case '/users/login':
                if (userInfo[0] === 'attempt') {
                    auditDesc = formatMessage(holders.attemptedLogin);
                } else if (userInfo[0] === 'success') {
                    auditDesc = formatMessage(holders.successfullLogin);
                } else if (userInfo[0] === 'authenticated') {
                    auditDesc = formatMessage(holders.authenticated);
                } else if (userInfo[0]) {
                    auditDesc = formatMessage(holders.failedLogin);
                }

                break;
            case '/users/revoke_session':
                auditDesc = formatMessage(holders.sessionRevoked, {sessionId: userInfo[0].split('=')[1]});
                break;
            case '/users/newimage':
                auditDesc = formatMessage(holders.updatePicture);
                break;
            case '/users/update':
                auditDesc = formatMessage(holders.updateGeneral);
                break;
            case '/users/newpassword':
                if (userInfo[0] === 'attempted') {
                    auditDesc = formatMessage(holders.attemptedPassword);
                } else if (userInfo[0] === 'completed') {
                    auditDesc = formatMessage(holders.successfullPassword);
                } else if (userInfo[0] === 'failed - tried to update user password who was logged in through oauth') {
                    auditDesc = formatMessage(holders.failedPassword);
                }

                break;
            case '/users/update_roles': {
                const userRoles = userInfo[0].split('=')[1];

                auditDesc = formatMessage(holders.updatedRol);
                if (userRoles.trim()) {
                    auditDesc += userRoles;
                } else {
                    auditDesc += formatMessage(holders.member);
                }

                break;
            }
            case '/users/update_active': {
                const updateType = userInfo[0].split('=')[0];
                const updateField = userInfo[0].split('=')[1];

                /* Either describes account activation/deactivation or a revoked session as part of an account deactivation */
                if (updateType === 'active') {
                    if (updateField === 'true') {
                        auditDesc = formatMessage(holders.accountActive);
                    } else if (updateField === 'false') {
                        auditDesc = formatMessage(holders.accountInactive);
                    }

                    const actingUserInfo = userInfo[1].split('=');
                    if (actingUserInfo[0] === 'session_user') {
                        const actingUser = this.props.getUser(actingUserInfo[1]);
                        const user = this.props.currentUser;
                        if (user && actingUser && isSystemAdmin(user.roles)) {
                            auditDesc += formatMessage(holders.by, {username: actingUser.username});
                        } else if (user && actingUser) {
                            auditDesc += formatMessage(holders.byAdmin);
                        }
                    }
                } else if (updateType === 'session_id') {
                    auditDesc = formatMessage(holders.sessionRevoked, {sessionId: updateField});
                }

                break;
            }
            case '/users/send_password_reset':
                auditDesc = formatMessage(holders.sentEmail, {email: userInfo[0].split('=')[1]});
                break;
            case '/users/reset_password':
                if (userInfo[0] === 'attempt') {
                    auditDesc = formatMessage(holders.attemptedReset);
                } else if (userInfo[0] === 'success') {
                    auditDesc = formatMessage(holders.successfullReset);
                }

                break;
            case '/users/update_notify':
                auditDesc = formatMessage(holders.updateGlobalNotifications);
                break;
            default:
                break;
            }
        } else if (actionURL.indexOf('/hooks') === 0) {
            const webhookInfo = audit.extra_info;

            switch (actionURL) {
            case '/hooks/incoming/create':
                if (webhookInfo === 'attempt') {
                    auditDesc = formatMessage(holders.attemptedWebhookCreate);
                } else if (webhookInfo === 'success') {
                    auditDesc = formatMessage(holders.succcessfullWebhookCreate);
                } else if (webhookInfo === 'fail - bad channel permissions') {
                    auditDesc = formatMessage(holders.failedWebhookCreate);
                }

                break;
            case '/hooks/incoming/delete':
                if (webhookInfo === 'attempt') {
                    auditDesc = formatMessage(holders.attemptedWebhookDelete);
                } else if (webhookInfo === 'success') {
                    auditDesc = formatMessage(holders.successfullWebhookDelete);
                } else if (webhookInfo === 'fail - inappropriate conditions') {
                    auditDesc = formatMessage(holders.failedWebhookDelete);
                }

                break;
            default:
                break;
            }
        } else if (actionURL.indexOf('/license') === 0) {
            const licenseInfo = audit.extra_info;

            switch (actionURL) {
            case '/license/add':
                if (licenseInfo === 'attempt') {
                    auditDesc = formatMessage(holders.attemptedLicenseAdd);
                } else if (licenseInfo === 'success') {
                    auditDesc = formatMessage(holders.successfullLicenseAdd);
                } else if (licenseInfo === 'failed - expired or non-started license') {
                    auditDesc = formatMessage(holders.failedExpiredLicenseAdd);
                } else if (licenseInfo === 'failed - invalid license') {
                    auditDesc = formatMessage(holders.failedInvalidLicenseAdd);
                }

                break;
            case '/license/remove':
                auditDesc = formatMessage(holders.licenseRemoved);
                break;
            default:
                break;
            }
        } else if (actionURL.indexOf('/admin/download_compliance_report') === 0) {
            auditDesc = toTitleCase(audit.extra_info);
        } else {
            switch (actionURL) {
            case '/logout':
                auditDesc = formatMessage(holders.logout);
                break;
            case '/verify_email':
                auditDesc = formatMessage(holders.verified);
                break;
            default:
                break;
            }
        }

        /* If all else fails... */
        if (!auditDesc) {
            /* Currently not called anywhere */
            if (audit.extra_info.indexOf('revoked_all=') >= 0) {
                auditDesc = formatMessage(holders.revokedAll);
            } else {
                let actionDesc = '';
                if (actionURL && actionURL.lastIndexOf('/') !== -1) {
                    actionDesc = actionURL.substring(actionURL.lastIndexOf('/') + 1).replace('_', ' ');
                    actionDesc = toTitleCase(actionDesc);
                }

                let extraInfoDesc = '';
                if (audit.extra_info) {
                    extraInfoDesc = audit.extra_info;

                    if (extraInfoDesc.indexOf('=') !== -1) {
                        extraInfoDesc = extraInfoDesc.substring(extraInfoDesc.indexOf('=') + 1);
                    }
                }
                auditDesc = actionDesc + ' ' + extraInfoDesc;
            }
        }

        const date = new Date(audit.create_at);
        const timestamp = (
            <div>
                <div>
                    <FormattedDate
                        value={date}
                        day='2-digit'
                        month='short'
                        year='numeric'
                    />
                </div>
                <div>
                    <FormattedTime
                        value={date}
                        hour='2-digit'
                        minute='2-digit'
                    />
                </div>
            </div>
        );

        const auditProfile = this.props.getUser(audit.user_id);

        const userId = auditProfile ? auditProfile.email : audit.user_id;
        const desc = auditDesc;
        const ip = audit.ip_address;
        const sessionId = audit.session_id;

        return {
            timestamp,
            userId,
            desc,
            ip,
            sessionId,
        };
    }
}

export default injectIntl(AuditTable);
