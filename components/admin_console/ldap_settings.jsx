// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import {ldapTest} from 'actions/admin_actions.jsx';

import {JobTypes} from 'utils/constants.jsx';
import * as Utils from 'utils/utils.jsx';

import AdminSettings from './admin_settings.jsx';
import BooleanSetting from './boolean_setting.jsx';
import {ConnectionSecurityDropdownSettingLdap} from './connection_security_dropdown_setting.jsx';
import JobsTable from './jobs';
import RequestButton from './request_button/request_button.jsx';
import SettingsGroup from './settings_group.jsx';
import TextSetting from './text_setting.jsx';

export default class LdapSettings extends AdminSettings {
    constructor(props) {
        super(props);

        this.getConfigFromState = this.getConfigFromState.bind(this);
        this.renderSettings = this.renderSettings.bind(this);
    }

    getConfigFromState(config) {
        config.LdapSettings.Enable = this.state.enable;
        config.LdapSettings.EnableSync = this.state.enableSync;
        config.LdapSettings.LdapServer = this.state.ldapServer;
        config.LdapSettings.LdapPort = this.parseIntNonZero(this.state.ldapPort);
        config.LdapSettings.ConnectionSecurity = this.state.connectionSecurity;
        config.LdapSettings.BaseDN = this.state.baseDN;
        config.LdapSettings.BindUsername = this.state.bindUsername;
        config.LdapSettings.BindPassword = this.state.bindPassword;
        config.LdapSettings.UserFilter = this.state.userFilter;
        config.LdapSettings.FirstNameAttribute = this.state.firstNameAttribute;
        config.LdapSettings.LastNameAttribute = this.state.lastNameAttribute;
        config.LdapSettings.NicknameAttribute = this.state.nicknameAttribute;
        config.LdapSettings.EmailAttribute = this.state.emailAttribute;
        config.LdapSettings.UsernameAttribute = this.state.usernameAttribute;
        config.LdapSettings.PositionAttribute = this.state.positionAttribute;
        config.LdapSettings.IdAttribute = this.state.idAttribute;
        config.LdapSettings.SyncIntervalMinutes = this.parseIntNonZero(this.state.syncIntervalMinutes);
        config.LdapSettings.SkipCertificateVerification = this.state.skipCertificateVerification;
        config.LdapSettings.QueryTimeout = this.parseIntNonZero(this.state.queryTimeout);
        config.LdapSettings.MaxPageSize = this.parseInt(this.state.maxPageSize);
        config.LdapSettings.LoginFieldName = this.state.loginFieldName;

        return config;
    }

    getStateFromConfig(config) {
        return {
            enable: config.LdapSettings.Enable,
            enableSync: config.LdapSettings.EnableSync,
            ldapServer: config.LdapSettings.LdapServer,
            ldapPort: config.LdapSettings.LdapPort,
            connectionSecurity: config.LdapSettings.ConnectionSecurity,
            baseDN: config.LdapSettings.BaseDN,
            bindUsername: config.LdapSettings.BindUsername,
            bindPassword: config.LdapSettings.BindPassword,
            userFilter: config.LdapSettings.UserFilter,
            firstNameAttribute: config.LdapSettings.FirstNameAttribute,
            lastNameAttribute: config.LdapSettings.LastNameAttribute,
            nicknameAttribute: config.LdapSettings.NicknameAttribute,
            emailAttribute: config.LdapSettings.EmailAttribute,
            usernameAttribute: config.LdapSettings.UsernameAttribute,
            positionAttribute: config.LdapSettings.PositionAttribute,
            idAttribute: config.LdapSettings.IdAttribute,
            syncIntervalMinutes: config.LdapSettings.SyncIntervalMinutes,
            skipCertificateVerification: config.LdapSettings.SkipCertificateVerification,
            queryTimeout: config.LdapSettings.QueryTimeout,
            maxPageSize: config.LdapSettings.MaxPageSize,
            loginFieldName: config.LdapSettings.LoginFieldName
        };
    }

    renderTitle() {
        return (
            <FormattedMessage
                id='admin.authentication.ldap'
                defaultMessage='AD/LDAP'
            />
        );
    }

    shouldBeDisabled = () => {
        return !(this.state.enable || this.state.enableSync);
    }

    renderJobData(job) {
        let mattermostUsers = '0';
        let ldapUsers = '0';
        let deleteCount = '0';
        let updateCount = '0';

        if (job && job.data) {
            if (job.data.mattermost_users_count && job.data.mattermost_users_count.length > 0) {
                mattermostUsers = job.data.mattermost_users_count;
            }

            if (job.data.ldap_users_count && job.data.ldap_users_count.length > 0) {
                ldapUsers = job.data.ldap_users_count;
            }

            if (job.data.delete_count && job.data.delete_count.length > 0) {
                deleteCount = job.data.delete_count;
            }

            if (job.data.update_count && job.data.update_count.length > 0) {
                updateCount = job.data.update_count;
            }
        }

        return (
            <FormattedMessage
                id='admin.ldap.jobExtraInfo'
                defaultMessage='Scanned {ldapUsers} LDAP users, updated {updateCount}, deactivated {deleteCount}'
                values={{
                    mattermostUsers,
                    ldapUsers,
                    deleteCount,
                    updateCount
                }}
            />
        );
    }

    renderSettings() {
        const licenseEnabled = global.window.mm_license.IsLicensed === 'true' && global.window.mm_license.LDAP === 'true';
        if (!licenseEnabled) {
            return null;
        }

        return (
            <SettingsGroup>
                <BooleanSetting
                    id='enable'
                    label={
                        <FormattedMessage
                            id='admin.ldap.enableTitle'
                            defaultMessage='Enable sign-in with AD/LDAP:'
                        />
                    }
                    helpText={
                        <FormattedMessage
                            id='admin.ldap.enableDesc'
                            defaultMessage='When true, Mattermost allows login using AD/LDAP'
                        />
                    }
                    value={this.state.enable}
                    onChange={this.handleChange}
                />
                <BooleanSetting
                    id='enableSync'
                    label={
                        <FormattedMessage
                            id='admin.ldap.enableSyncTitle'
                            defaultMessage='Enable Synchronization with AD/LDAP:'
                        />
                    }
                    helpText={
                        <FormattedMessage
                            id='admin.ldap.enableSyncDesc'
                            defaultMessage='When true, Mattermost periodically synchronizes users from AD/LDAP.'
                        />
                    }
                    value={this.state.enableSync}
                    onChange={this.handleChange}
                />
                <TextSetting
                    id='ldapServer'
                    label={
                        <FormattedMessage
                            id='admin.ldap.serverTitle'
                            defaultMessage='AD/LDAP Server:'
                        />
                    }
                    placeholder={Utils.localizeMessage('admin.ldap.serverEx', 'Ex "10.0.0.23"')}
                    helpText={
                        <FormattedMessage
                            id='admin.ldap.serverDesc'
                            defaultMessage='The domain or IP address of AD/LDAP server.'
                        />
                    }
                    value={this.state.ldapServer}
                    onChange={this.handleChange}
                    disabled={this.shouldBeDisabled()}
                />
                <TextSetting
                    id='ldapPort'
                    label={
                        <FormattedMessage
                            id='admin.ldap.portTitle'
                            defaultMessage='AD/LDAP Port:'
                        />
                    }
                    placeholder={Utils.localizeMessage('admin.ldap.portEx', 'Ex "389"')}
                    helpText={
                        <FormattedMessage
                            id='admin.ldap.portDesc'
                            defaultMessage='The port Mattermost will use to connect to the AD/LDAP server. Default is 389.'
                        />
                    }
                    value={this.state.ldapPort}
                    onChange={this.handleChange}
                    disabled={this.shouldBeDisabled()}
                />
                <ConnectionSecurityDropdownSettingLdap
                    value={this.state.connectionSecurity}
                    onChange={this.handleChange}
                    disabled={this.shouldBeDisabled()}
                />
                <BooleanSetting
                    id='skipCertificateVerification'
                    label={
                        <FormattedMessage
                            id='admin.ldap.skipCertificateVerification'
                            defaultMessage='Skip Certificate Verification:'
                        />
                    }
                    helpText={
                        <FormattedMessage
                            id='admin.ldap.skipCertificateVerificationDesc'
                            defaultMessage='Skips the certificate verification step for TLS or STARTTLS connections. Not recommended for production environments where TLS is required. For testing only.'
                        />
                    }
                    value={this.state.skipCertificateVerification}
                    onChange={this.handleChange}
                />
                <TextSetting
                    id='baseDN'
                    label={
                        <FormattedMessage
                            id='admin.ldap.baseTitle'
                            defaultMessage='BaseDN:'
                        />
                    }
                    placeholder={Utils.localizeMessage('admin.ldap.baseEx', 'Ex "ou=Unit Name,dc=corp,dc=example,dc=com"')}
                    helpText={
                        <FormattedMessage
                            id='admin.ldap.baseDesc'
                            defaultMessage='The Base DN is the Distinguished Name of the location where Mattermost should start its search for users in the AD/LDAP tree.'
                        />
                    }
                    value={this.state.baseDN}
                    onChange={this.handleChange}
                    disabled={this.shouldBeDisabled()}
                />
                <TextSetting
                    id='bindUsername'
                    label={
                        <FormattedMessage
                            id='admin.ldap.bindUserTitle'
                            defaultMessage='Bind Username:'
                        />
                    }
                    helpText={
                        <FormattedMessage
                            id='admin.ldap.bindUserDesc'
                            defaultMessage='The username used to perform the AD/LDAP search. This should typically be an account created specifically for use with Mattermost. It should have access limited to read the portion of the AD/LDAP tree specified in the BaseDN field.'
                        />
                    }
                    value={this.state.bindUsername}
                    onChange={this.handleChange}
                    disabled={this.shouldBeDisabled()}
                />
                <TextSetting
                    id='bindPassword'
                    label={
                        <FormattedMessage
                            id='admin.ldap.bindPwdTitle'
                            defaultMessage='Bind Password:'
                        />
                    }
                    helpText={
                        <FormattedMessage
                            id='admin.ldap.bindPwdDesc'
                            defaultMessage='Password of the user given in "Bind Username".'
                        />
                    }
                    value={this.state.bindPassword}
                    onChange={this.handleChange}
                    disabled={this.shouldBeDisabled()}
                />
                <TextSetting
                    id='userFilter'
                    label={
                        <FormattedMessage
                            id='admin.ldap.userFilterTitle'
                            defaultMessage='User Filter:'
                        />
                    }
                    placeholder={Utils.localizeMessage('admin.ldap.userFilterEx', 'Ex. "(objectClass=user)"')}
                    helpText={
                        <FormattedMessage
                            id='admin.ldap.userFilterDisc'
                            defaultMessage='(Optional) Enter an AD/LDAP Filter to use when searching for user objects. Only the users selected by the query will be able to access Mattermost. For Active Directory, the query to filter out disabled users is (&(objectCategory=Person)(!(UserAccountControl:1.2.840.113556.1.4.803:=2))).'
                        />
                    }
                    value={this.state.userFilter}
                    onChange={this.handleChange}
                    disabled={this.shouldBeDisabled()}
                />
                <TextSetting
                    id='firstNameAttribute'
                    label={
                        <FormattedMessage
                            id='admin.ldap.firstnameAttrTitle'
                            defaultMessage='First Name Attribute'
                        />
                    }
                    placeholder={Utils.localizeMessage('admin.ldap.firstnameAttrEx', 'Ex "givenName"')}
                    helpText={
                        <FormattedMessage
                            id='admin.ldap.firstnameAttrDesc'
                            defaultMessage='(Optional) The attribute in the AD/LDAP server that will be used to populate the first name of users in Mattermost.  When set, users will not be able to edit their first name, since it is synchronized with the LDAP server. When left blank, users can set their own first name in Account Settings.'
                        />
                    }
                    value={this.state.firstNameAttribute}
                    onChange={this.handleChange}
                    disabled={this.shouldBeDisabled()}
                />
                <TextSetting
                    id='lastNameAttribute'
                    label={
                        <FormattedMessage
                            id='admin.ldap.lastnameAttrTitle'
                            defaultMessage='Last Name Attribute:'
                        />
                    }
                    placeholder={Utils.localizeMessage('admin.ldap.lastnameAttrEx', 'Ex "sn"')}
                    helpText={
                        <FormattedMessage
                            id='admin.ldap.lastnameAttrDesc'
                            defaultMessage='(Optional) The attribute in the AD/LDAP server that will be used to populate the last name of users in Mattermost. When set, users will not be able to edit their last name, since it is synchronized with the LDAP server. When left blank, users can set their own last name in Account Settings.'
                        />
                    }
                    value={this.state.lastNameAttribute}
                    onChange={this.handleChange}
                    disabled={this.shouldBeDisabled()}
                />
                <TextSetting
                    id='nicknameAttribute'
                    label={
                        <FormattedMessage
                            id='admin.ldap.nicknameAttrTitle'
                            defaultMessage='Nickname Attribute:'
                        />
                    }
                    placeholder={Utils.localizeMessage('admin.ldap.nicknameAttrEx', 'Ex "nickname"')}
                    helpText={
                        <FormattedMessage
                            id='admin.ldap.nicknameAttrDesc'
                            defaultMessage='(Optional) The attribute in the AD/LDAP server that will be used to populate the nickname of users in Mattermost. When set, users will not be able to edit their nickname, since it is synchronized with the LDAP server. When left blank, users can set their own nickname in Account Settings.'
                        />
                    }
                    value={this.state.nicknameAttribute}
                    onChange={this.handleChange}
                    disabled={this.shouldBeDisabled()}
                />
                <TextSetting
                    id='positionAttribute'
                    label={
                        <FormattedMessage
                            id='admin.ldap.positionAttrTitle'
                            defaultMessage='Position Attribute:'
                        />
                    }
                    placeholder={Utils.localizeMessage('admin.ldap.positionAttrEx', 'E.g.: "title"')}
                    helpText={
                        <FormattedMessage
                            id='admin.ldap.positionAttrDesc'
                            defaultMessage='(Optional) The attribute in the AD/LDAP server that will be used to populate the position field in Mattermost.'
                        />
                    }
                    value={this.state.positionAttribute}
                    onChange={this.handleChange}
                    disabled={this.shouldBeDisabled()}
                />
                <TextSetting
                    id='emailAttribute'
                    label={
                        <FormattedMessage
                            id='admin.ldap.emailAttrTitle'
                            defaultMessage='Email Attribute:'
                        />
                    }
                    placeholder={Utils.localizeMessage('admin.ldap.emailAttrEx', 'Ex "mail" or "userPrincipalName"')}
                    helpText={
                        <FormattedMessage
                            id='admin.ldap.emailAttrDesc'
                            defaultMessage='The attribute in the AD/LDAP server that will be used to populate the email addresses of users in Mattermost.'
                        />
                    }
                    value={this.state.emailAttribute}
                    onChange={this.handleChange}
                    disabled={this.shouldBeDisabled()}
                />
                <TextSetting
                    id='usernameAttribute'
                    label={
                        <FormattedMessage
                            id='admin.ldap.usernameAttrTitle'
                            defaultMessage='Username Attribute:'
                        />
                    }
                    placeholder={Utils.localizeMessage('admin.ldap.usernameAttrEx', 'Ex "sAMAccountName"')}
                    helpText={
                        <FormattedMessage
                            id='admin.ldap.uernameAttrDesc'
                            defaultMessage='The attribute in the AD/LDAP server that will be used to populate the username field in Mattermost. This may be the same as the ID Attribute.'
                        />
                    }
                    value={this.state.usernameAttribute}
                    onChange={this.handleChange}
                    disabled={this.shouldBeDisabled()}
                />
                <TextSetting
                    id='idAttribute'
                    label={
                        <FormattedMessage
                            id='admin.ldap.idAttrTitle'
                            defaultMessage='ID Attribute: '
                        />
                    }
                    placeholder={Utils.localizeMessage('admin.ldap.idAttrEx', 'Ex "sAMAccountName"')}
                    helpText={
                        <FormattedMessage
                            id='admin.ldap.idAttrDesc'
                            defaultMessage='The attribute in the AD/LDAP server that will be used as a unique identifier in Mattermost. It should be an AD/LDAP attribute with a value that does not change, such as username or uid. If a user’s ID Attribute changes, it will create a new Mattermost account unassociated with their old one. This is the value used to log in to Mattermost in the "AD/LDAP Username" field on the sign in page. Normally this attribute is the same as the "Username Attribute" field above. If your team typically uses domain\\username to sign in to other services with AD/LDAP, you may choose to put domain\\username in this field to maintain consistency between sites.'
                        />
                    }
                    value={this.state.idAttribute}
                    onChange={this.handleChange}
                    disabled={this.shouldBeDisabled()}
                />
                <TextSetting
                    id='loginFieldName'
                    label={
                        <FormattedMessage
                            id='admin.ldap.loginNameTitle'
                            defaultMessage='Sign-in Field Default Text:'
                        />
                    }
                    placeholder={Utils.localizeMessage('admin.ldap.loginNameEx', 'Ex "AD/LDAP Username"')}
                    helpText={
                        <FormattedMessage
                            id='admin.ldap.loginNameDesc'
                            defaultMessage='The placeholder text that appears in the login field on the login page. Defaults to "AD/LDAP Username".'
                        />
                    }
                    value={this.state.loginFieldName}
                    onChange={this.handleChange}
                    disabled={this.shouldBeDisabled()}
                />
                <TextSetting
                    id='syncIntervalMinutes'
                    label={
                        <FormattedMessage
                            id='admin.ldap.syncIntervalTitle'
                            defaultMessage='Synchronization Interval (minutes):'
                        />
                    }
                    helpText={
                        <FormattedMessage
                            id='admin.ldap.syncIntervalHelpText'
                            defaultMessage='AD/LDAP Synchronization updates Mattermost user information to reflect updates on the AD/LDAP server. For example, when a user’s name changes on the AD/LDAP server, the change updates in Mattermost when synchronization is performed. Accounts removed from or disabled in the AD/LDAP server have their Mattermost accounts set to "Inactive" and have their account sessions revoked. Mattermost performs synchronization on the interval entered. For example, if 60 is entered, Mattermost synchronizes every 60 minutes.'
                        />
                    }
                    value={this.state.syncIntervalMinutes}
                    onChange={this.handleChange}
                    disabled={this.shouldBeDisabled()}
                />
                <TextSetting
                    id='maxPageSize'
                    label={
                        <FormattedMessage
                            id='admin.ldap.maxPageSizeTitle'
                            defaultMessage='Maximum Page Size:'
                        />
                    }
                    placeholder={Utils.localizeMessage('admin.ldap.maxPageSizeEx', 'Ex "2000"')}
                    helpText={
                        <FormattedMessage
                            id='admin.ldap.maxPageSizeHelpText'
                            defaultMessage='The maximum number of users the Mattermost server will request from the AD/LDAP server at one time. 0 is unlimited.'
                        />
                    }
                    value={this.state.maxPageSize}
                    onChange={this.handleChange}
                    disabled={this.shouldBeDisabled()}
                />
                <TextSetting
                    id='queryTimeout'
                    label={
                        <FormattedMessage
                            id='admin.ldap.queryTitle'
                            defaultMessage='Query Timeout (seconds):'
                        />
                    }
                    placeholder={Utils.localizeMessage('admin.ldap.queryEx', 'Ex "60"')}
                    helpText={
                        <FormattedMessage
                            id='admin.ldap.queryDesc'
                            defaultMessage='The timeout value for queries to the AD/LDAP server. Increase if you are getting timeout errors caused by a slow AD/LDAP server.'
                        />
                    }
                    value={this.state.queryTimeout}
                    onChange={this.handleChange}
                    disabled={this.shouldBeDisabled()}
                />
                <RequestButton
                    requestAction={ldapTest}
                    helpText={
                        <FormattedMessage
                            id='admin.ldap.testHelpText'
                            defaultMessage='Tests if the Mattermost server can connect to the AD/LDAP server specified. See log file for more detailed error messages.'
                        />
                    }
                    buttonText={
                        <FormattedMessage
                            id='admin.ldap.ldap_test_button'
                            defaultMessage='AD/LDAP Test'
                        />
                    }
                    disabled={this.shouldBeDisabled()}
                    saveNeeded={this.state.saveNeeded}
                    saveConfigAction={this.doSubmit}
                    errorMessage={{
                        id: 'admin.ldap.testFailure',
                        defaultMessage: 'AD/LDAP Test Failure: {error}'
                    }}
                    successMessage={{
                        id: 'admin.ldap.testSuccess',
                        defaultMessage: 'AD/LDAP Test Successful'
                    }}
                />
                <JobsTable
                    jobType={JobTypes.LDAP_SYNC}
                    getExtraInfoText={this.renderJobData}
                    disabled={this.shouldBeDisabled()}
                    createJobButtonText={
                        <FormattedMessage
                            id='admin.ldap.sync_button'
                            defaultMessage='AD/LDAP Synchronize Now'
                        />
                    }
                    createJobHelpText={
                        <FormattedMessage
                            id='admin.ldap.syncNowHelpText'
                            defaultMessage='Initiates an AD/LDAP synchronization immediately.'
                        />
                    }
                />
            </SettingsGroup>
        );
    }
}
