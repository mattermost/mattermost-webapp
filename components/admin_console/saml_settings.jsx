// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedHTMLMessage, FormattedMessage} from 'react-intl';

import * as AdminActions from 'actions/admin_actions.jsx';
import * as Utils from 'utils/utils.jsx';

import AdminSettings from './admin_settings.jsx';
import BooleanSetting from './boolean_setting.jsx';
import FileUploadSetting from './file_upload_setting.jsx';
import RemoveFileSetting from './remove_file_setting.jsx';
import SettingsGroup from './settings_group.jsx';
import TextSetting from './text_setting.jsx';

export default class SamlSettings extends AdminSettings {
    constructor(props) {
        super(props);

        this.getConfigFromState = this.getConfigFromState.bind(this);

        this.renderSettings = this.renderSettings.bind(this);
        this.uploadCertificate = this.uploadCertificate.bind(this);
        this.removeCertificate = this.removeCertificate.bind(this);
    }

    getConfigFromState(config) {
        config.SamlSettings.Enable = this.state.enable;
        config.SamlSettings.EnableSyncWithLdap = this.state.enableSyncWithLdap;
        config.SamlSettings.Verify = this.state.verify;
        config.SamlSettings.Encrypt = this.state.encrypt;
        config.SamlSettings.IdpUrl = this.state.idpUrl;
        config.SamlSettings.IdpDescriptorUrl = this.state.idpDescriptorUrl;
        config.SamlSettings.AssertionConsumerServiceURL = this.state.assertionConsumerServiceURL;
        config.SamlSettings.IdpCertificateFile = this.state.idpCertificateFile;
        config.SamlSettings.PublicCertificateFile = this.state.publicCertificateFile;
        config.SamlSettings.PrivateKeyFile = this.state.privateKeyFile;
        config.SamlSettings.FirstNameAttribute = this.state.firstNameAttribute;
        config.SamlSettings.LastNameAttribute = this.state.lastNameAttribute;
        config.SamlSettings.EmailAttribute = this.state.emailAttribute;
        config.SamlSettings.UsernameAttribute = this.state.usernameAttribute;
        config.SamlSettings.NicknameAttribute = this.state.nicknameAttribute;
        config.SamlSettings.PositionAttribute = this.state.positionAttribute;
        config.SamlSettings.LocaleAttribute = this.state.localeAttribute;
        config.SamlSettings.LoginButtonText = this.state.loginButtonText;

        return config;
    }

    getStateFromConfig(config) {
        const settings = config.SamlSettings;

        // pre-populate Service Provider Login URL page
        const siteUrl = config.ServiceSettings.SiteURL;
        let consumerServiceUrl = settings.AssertionConsumerServiceURL;
        if (siteUrl.length > 0 && consumerServiceUrl.length === 0) {
            const addSlashIfNeeded = siteUrl[siteUrl.length - 1] === '/' ? '' : '/';
            consumerServiceUrl = `${siteUrl}${addSlashIfNeeded}login/sso/saml`;
        }

        return {
            siteUrlSet: siteUrl.length > 0,
            enable: settings.Enable,
            enableSyncWithLdap: settings.EnableSyncWithLdap,
            verify: settings.Verify,
            encrypt: settings.Encrypt,
            idpUrl: settings.IdpUrl,
            idpDescriptorUrl: settings.IdpDescriptorUrl,
            assertionConsumerServiceURL: consumerServiceUrl,
            idpCertificateFile: settings.IdpCertificateFile,
            publicCertificateFile: settings.PublicCertificateFile,
            privateKeyFile: settings.PrivateKeyFile,
            firstNameAttribute: settings.FirstNameAttribute,
            lastNameAttribute: settings.LastNameAttribute,
            emailAttribute: settings.EmailAttribute,
            usernameAttribute: settings.UsernameAttribute,
            nicknameAttribute: settings.NicknameAttribute,
            positionAttribute: settings.PositionAttribute,
            localeAttribute: settings.LocaleAttribute,
            loginButtonText: settings.LoginButtonText,
        };
    }

    componentWillMount() {
        AdminActions.samlCertificateStatus(
            (data) => {
                const files = {};
                if (!data.idp_certificate_file) {
                    files.idpCertificateFile = '';
                }

                if (!data.public_certificate_file) {
                    files.publicCertificateFile = '';
                }

                if (!data.private_key_file) {
                    files.privateKeyFile = '';
                }
                this.setState(files);
            }
        );
    }

    uploadCertificate(id, file, callback) {
        const complete = () => {
            const fileName = file.name;
            this.handleChange(id, fileName);
            this.setState({[id]: fileName, [`${id}Error`]: null});
            if (callback && typeof callback === 'function') {
                callback();
            }
        };

        function fail(error) {
            if (callback && typeof callback === 'function') {
                callback(error.message);
            }
        }

        if (id === 'idpCertificateFile') {
            AdminActions.uploadIdpSamlCertificate(file, complete, fail);
        } else if (id === 'publicCertificateFile') {
            AdminActions.uploadPublicSamlCertificate(file, complete, fail);
        } else if (id === 'privateKeyFile') {
            AdminActions.uploadPrivateSamlCertificate(file, complete, fail);
        }
    }

    removeCertificate(id, callback) {
        const complete = () => {
            this.handleChange(id, '');
            this.setState({[id]: null, [`${id}Error`]: null});
        };

        const fail = (error) => {
            if (callback && typeof callback === 'function') {
                callback();
            }
            this.setState({[id]: null, [`${id}Error`]: error.message});
        };

        if (id === 'idpCertificateFile') {
            AdminActions.removeIdpSamlCertificate(complete, fail);
        } else if (id === 'publicCertificateFile') {
            AdminActions.removePublicSamlCertificate(complete, fail);
        } else if (id === 'privateKeyFile') {
            AdminActions.removePrivateSamlCertificate(complete, fail);
        }
    }

    renderTitle() {
        return (
            <FormattedMessage
                id='admin.authentication.saml'
                defaultMessage='SAML 2.0'
            />
        );
    }

    renderSettings() {
        const licenseEnabled = this.props.license.IsLicensed === 'true' && this.props.license.SAML === 'true';
        if (!licenseEnabled) {
            return null;
        }

        let idpCert;
        let privKey;
        let pubCert;

        if (this.state.idpCertificateFile) {
            idpCert = (
                <RemoveFileSetting
                    id='idpCertificateFile'
                    label={
                        <FormattedMessage
                            id='admin.saml.idpCertificateFileTitle'
                            defaultMessage='Identity Provider Public Certificate:'
                        />
                    }
                    helpText={
                        <FormattedMessage
                            id='admin.saml.idpCertificateFileRemoveDesc'
                            defaultMessage='Remove the public authentication certificate issued by your Identity Provider.'
                        />
                    }
                    removeButtonText={Utils.localizeMessage('admin.saml.remove.idp_certificate', 'Remove Identity Provider Certificate')}
                    removingText={Utils.localizeMessage('admin.saml.removing.certificate', 'Removing Certificate...')}
                    fileName={this.state.idpCertificateFile}
                    onSubmit={this.removeCertificate}
                    disabled={!this.state.enable}
                />
            );
        } else {
            idpCert = (
                <FileUploadSetting
                    id='idpCertificateFile'
                    label={
                        <FormattedMessage
                            id='admin.saml.idpCertificateFileTitle'
                            defaultMessage='Identity Provider Public Certificate:'
                        />
                    }
                    helpText={
                        <FormattedMessage
                            id='admin.saml.idpCertificateFileDesc'
                            defaultMessage='The public authentication certificate issued by your Identity Provider.'
                        />
                    }
                    uploadingText={Utils.localizeMessage('admin.saml.uploading.certificate', 'Uploading Certificate...')}
                    disabled={!this.state.enable}
                    fileType='.crt,.cer,.cert,.pem'
                    onSubmit={this.uploadCertificate}
                    error={this.state.idpCertificateFileError}
                />
            );
        }

        if (this.state.privateKeyFile) {
            privKey = (
                <RemoveFileSetting
                    id='privateKeyFile'
                    label={
                        <FormattedMessage
                            id='admin.saml.privateKeyFileTitle'
                            defaultMessage='Service Provider Private Key:'
                        />
                    }
                    helpText={
                        <FormattedMessage
                            id='admin.saml.privateKeyFileFileRemoveDesc'
                            defaultMessage='Remove the private key used to decrypt SAML Assertions from the Identity Provider.'
                        />
                    }
                    removeButtonText={Utils.localizeMessage('admin.saml.remove.privKey', 'Remove Service Provider Private Key')}
                    removingText={Utils.localizeMessage('admin.saml.removing.privKey', 'Removing Private Key...')}
                    fileName={this.state.privateKeyFile}
                    onSubmit={this.removeCertificate}
                    disabled={!this.state.enable || !this.state.encrypt}
                />
            );
        } else {
            privKey = (
                <FileUploadSetting
                    id='privateKeyFile'
                    label={
                        <FormattedMessage
                            id='admin.saml.privateKeyFileTitle'
                            defaultMessage='Service Provider Private Key:'
                        />
                    }
                    helpText={
                        <FormattedMessage
                            id='admin.saml.privateKeyFileFileDesc'
                            defaultMessage='The private key used to decrypt SAML Assertions from the Identity Provider.'
                        />
                    }
                    uploadingText={Utils.localizeMessage('admin.saml.uploading.privateKey', 'Uploading Private Key...')}
                    disabled={!this.state.enable || !this.state.encrypt}
                    fileType='.key'
                    onSubmit={this.uploadCertificate}
                    error={this.state.privateKeyFileError}
                />
            );
        }

        if (this.state.publicCertificateFile) {
            pubCert = (
                <RemoveFileSetting
                    id='publicCertificateFile'
                    label={
                        <FormattedMessage
                            id='admin.saml.publicCertificateFileTitle'
                            defaultMessage='Service Provider Public Certificate:'
                        />
                    }
                    helpText={
                        <FormattedMessage
                            id='admin.saml.publicCertificateFileRemoveDesc'
                            defaultMessage='Remove the certificate used to generate the signature on a SAML request to the Identity Provider for a service provider initiated SAML login, when Mattermost is the Service Provider.'
                        />
                    }
                    removeButtonText={Utils.localizeMessage('admin.saml.remove.sp_certificate', 'Remove Service Provider Certificate')}
                    removingText={Utils.localizeMessage('admin.saml.removing.certificate', 'Removing Certificate...')}
                    fileName={this.state.publicCertificateFile}
                    onSubmit={this.removeCertificate}
                    disabled={!this.state.enable || !this.state.encrypt}
                />
            );
        } else {
            pubCert = (
                <FileUploadSetting
                    id='publicCertificateFile'
                    label={
                        <FormattedMessage
                            id='admin.saml.publicCertificateFileTitle'
                            defaultMessage='Service Provider Public Certificate:'
                        />
                    }
                    helpText={
                        <FormattedMessage
                            id='admin.saml.publicCertificateFileDesc'
                            defaultMessage='The certificate used to generate the signature on a SAML request to the Identity Provider for a service provider initiated SAML login, when Mattermost is the Service Provider.'
                        />
                    }
                    uploadingText={Utils.localizeMessage('admin.saml.uploading.certificate', 'Uploading Certificate...')}
                    disabled={!this.state.enable || !this.state.encrypt}
                    fileType='.crt,.cer'
                    onSubmit={this.uploadCertificate}
                    error={this.state.publicCertificateFileError}
                />
            );
        }

        let consumerServiceUrlHelp;
        if (this.state.siteUrlSet) {
            consumerServiceUrlHelp = (
                <FormattedMessage
                    id='admin.saml.assertionConsumerServiceURLPopulatedDesc'
                    defaultMessage='This field is also known as the Assertion Consumer Service URL.'
                />
            );
        } else {
            consumerServiceUrlHelp = (
                <FormattedMessage
                    id='admin.saml.assertionConsumerServiceURLDesc'
                    defaultMessage='Enter https://<your-mattermost-url>/login/sso/saml. Make sure you use HTTP or HTTPS in your URL depending on your server configuration. This field is also known as the Assertion Consumer Service URL.'
                />
            );
        }

        return (
            <SettingsGroup>
                <BooleanSetting
                    id='enable'
                    label={
                        <FormattedMessage
                            id='admin.saml.enableTitle'
                            defaultMessage='Enable Login With SAML 2.0:'
                        />
                    }
                    helpText={
                        <FormattedHTMLMessage
                            id='admin.saml.enableDescription'
                            defaultMessage='When true, Mattermost allows login using SAML 2.0. Please see <a href="http://docs.mattermost.com/deployment/sso-saml.html" target="_blank">documentation</a> to learn more about configuring SAML for Mattermost.'
                        />
                    }
                    value={this.state.enable}
                    onChange={this.handleChange}
                />
                <BooleanSetting
                    id='enableSyncWithLdap'
                    label={
                        <FormattedMessage
                            id='admin.saml.enableSyncWithLdapTitle'
                            defaultMessage='Enable Synchronizing SAML Accounts With AD/LDAP:'
                        />
                    }
                    helpText={
                        <FormattedHTMLMessage
                            id='admin.saml.enableSyncWithLdapDescription'
                            defaultMessage='When true, Mattermost periodically synchronizes SAML user attributes, including user deactivation and removal, from AD/LDAP. Enable and configure synchronization settings at <strong>Authentication > AD/LDAP</strong>. When false, user attributes are updated from SAML during user login. See <a href="https://about.mattermost.com/default-saml-ldap-sync" target="_blank">documentation</a> to learn more.'
                        />
                    }
                    value={this.state.enableSyncWithLdap}
                    onChange={this.handleChange}
                    disabled={!this.state.enable}
                />
                <TextSetting
                    id='idpUrl'
                    label={
                        <FormattedMessage
                            id='admin.saml.idpUrlTitle'
                            defaultMessage='SAML SSO URL:'
                        />
                    }
                    placeholder={Utils.localizeMessage('admin.saml.idpUrlEx', 'E.g.: "https://idp.example.org/SAML2/SSO/Login"')}
                    helpText={
                        <FormattedMessage
                            id='admin.saml.idpUrlDesc'
                            defaultMessage='The URL where Mattermost sends a SAML request to start login sequence.'
                        />
                    }
                    value={this.state.idpUrl}
                    onChange={this.handleChange}
                    disabled={!this.state.enable}
                />
                <TextSetting
                    id='idpDescriptorUrl'
                    label={
                        <FormattedMessage
                            id='admin.saml.idpDescriptorUrlTitle'
                            defaultMessage='Identity Provider Issuer URL:'
                        />
                    }
                    placeholder={Utils.localizeMessage('admin.saml.idpDescriptorUrlEx', 'E.g.: "https://idp.example.org/SAML2/issuer"')}
                    helpText={
                        <FormattedMessage
                            id='admin.saml.idpDescriptorUrlDesc'
                            defaultMessage='The issuer URL for the Identity Provider you use for SAML requests.'
                        />
                    }
                    value={this.state.idpDescriptorUrl}
                    onChange={this.handleChange}
                    disabled={!this.state.enable}
                />
                {idpCert}
                <BooleanSetting
                    id='verify'
                    label={
                        <FormattedMessage
                            id='admin.saml.verifyTitle'
                            defaultMessage='Verify Signature:'
                        />
                    }
                    helpText={
                        <FormattedMessage
                            id='admin.saml.verifyDescription'
                            defaultMessage='When false, Mattermost will not verify that the signature sent from a SAML Response matches the Service Provider Login URL. Not recommended for production environments. For testing only.'
                        />
                    }
                    value={this.state.verify}
                    disabled={!this.state.enable}
                    onChange={this.handleChange}
                />
                <TextSetting
                    id='assertionConsumerServiceURL'
                    label={
                        <FormattedMessage
                            id='admin.saml.assertionConsumerServiceURLTitle'
                            defaultMessage='Service Provider Login URL:'
                        />
                    }
                    placeholder={Utils.localizeMessage('admin.saml.assertionConsumerServiceURLEx', 'E.g.: "https://<your-mattermost-url>/login/sso/saml"')}
                    helpText={consumerServiceUrlHelp}
                    value={this.state.assertionConsumerServiceURL}
                    onChange={this.handleChange}
                    disabled={!this.state.enable || !this.state.verify || this.state.siteUrlSet}
                />
                <BooleanSetting
                    id='encrypt'
                    label={
                        <FormattedMessage
                            id='admin.saml.encryptTitle'
                            defaultMessage='Enable Encryption:'
                        />
                    }
                    helpText={
                        <FormattedMessage
                            id='admin.saml.encryptDescription'
                            defaultMessage='When false, Mattermost will not decrypt SAML Assertions encrypted with your Service Provider Public Certificate. Not recommended for production environments. For testing only.'
                        />
                    }
                    value={this.state.encrypt}
                    disabled={!this.state.enable}
                    onChange={this.handleChange}
                />
                {privKey}
                {pubCert}
                <TextSetting
                    id='emailAttribute'
                    label={
                        <FormattedMessage
                            id='admin.saml.emailAttrTitle'
                            defaultMessage='Email Attribute:'
                        />
                    }
                    placeholder={Utils.localizeMessage('admin.saml.emailAttrEx', 'E.g.: "Email" or "PrimaryEmail"')}
                    helpText={
                        <FormattedMessage
                            id='admin.saml.emailAttrDesc'
                            defaultMessage='The attribute in the SAML Assertion that will be used to populate the email addresses of users in Mattermost.'
                        />
                    }
                    value={this.state.emailAttribute}
                    onChange={this.handleChange}
                    disabled={!this.state.enable}
                />
                <TextSetting
                    id='usernameAttribute'
                    label={
                        <FormattedMessage
                            id='admin.saml.usernameAttrTitle'
                            defaultMessage='Username Attribute:'
                        />
                    }
                    placeholder={Utils.localizeMessage('admin.saml.usernameAttrEx', 'E.g.: "Username"')}
                    helpText={
                        <FormattedMessage
                            id='admin.saml.usernameAttrDesc'
                            defaultMessage='The attribute in the SAML Assertion that will be used to populate the username field in Mattermost.'
                        />
                    }
                    value={this.state.usernameAttribute}
                    onChange={this.handleChange}
                    disabled={!this.state.enable}
                />
                <TextSetting
                    id='firstNameAttribute'
                    label={
                        <FormattedMessage
                            id='admin.saml.firstnameAttrTitle'
                            defaultMessage='First Name Attribute:'
                        />
                    }
                    placeholder={Utils.localizeMessage('admin.saml.firstnameAttrEx', 'E.g.: "FirstName"')}
                    helpText={
                        <FormattedMessage
                            id='admin.saml.firstnameAttrDesc'
                            defaultMessage='(Optional) The attribute in the SAML Assertion that will be used to populate the first name of users in Mattermost.'
                        />
                    }
                    value={this.state.firstNameAttribute}
                    onChange={this.handleChange}
                    disabled={!this.state.enable}
                />
                <TextSetting
                    id='lastNameAttribute'
                    label={
                        <FormattedMessage
                            id='admin.saml.lastnameAttrTitle'
                            defaultMessage='Last Name Attribute:'
                        />
                    }
                    placeholder={Utils.localizeMessage('admin.saml.lastnameAttrEx', 'E.g.: "LastName"')}
                    helpText={
                        <FormattedMessage
                            id='admin.saml.lastnameAttrDesc'
                            defaultMessage='(Optional) The attribute in the SAML Assertion that will be used to populate the last name of users in Mattermost.'
                        />
                    }
                    value={this.state.lastNameAttribute}
                    onChange={this.handleChange}
                    disabled={!this.state.enable}
                />
                <TextSetting
                    id='nicknameAttribute'
                    label={
                        <FormattedMessage
                            id='admin.saml.nicknameAttrTitle'
                            defaultMessage='Nickname Attribute:'
                        />
                    }
                    placeholder={Utils.localizeMessage('admin.saml.nicknameAttrEx', 'E.g.: "Nickname"')}
                    helpText={
                        <FormattedMessage
                            id='admin.saml.nicknameAttrDesc'
                            defaultMessage='(Optional) The attribute in the SAML Assertion that will be used to populate the nickname of users in Mattermost.'
                        />
                    }
                    value={this.state.nicknameAttribute}
                    onChange={this.handleChange}
                    disabled={!this.state.enable}
                />
                <TextSetting
                    id='positionAttribute'
                    label={
                        <FormattedMessage
                            id='admin.saml.positionAttrTitle'
                            defaultMessage='Position Attribute:'
                        />
                    }
                    placeholder={Utils.localizeMessage('admin.saml.positionAttrEx', 'E.g.: "Role"')}
                    helpText={
                        <FormattedMessage
                            id='admin.saml.positionAttrDesc'
                            defaultMessage='(Optional) The attribute in the SAML Assertion that will be used to populate the position of users in Mattermost.'
                        />
                    }
                    value={this.state.positionAttribute}
                    onChange={this.handleChange}
                    disabled={!this.state.enable}
                />
                <TextSetting
                    id='localeAttribute'
                    label={
                        <FormattedMessage
                            id='admin.saml.localeAttrTitle'
                            defaultMessage='Preferred Language Attribute:'
                        />
                    }
                    placeholder={Utils.localizeMessage('admin.saml.localeAttrEx', 'E.g.: "Locale" or "PrimaryLanguage"')}
                    helpText={
                        <FormattedMessage
                            id='admin.saml.localeAttrDesc'
                            defaultMessage='(Optional) The attribute in the SAML Assertion that will be used to populate the language of users in Mattermost.'
                        />
                    }
                    value={this.state.localeAttribute}
                    onChange={this.handleChange}
                    disabled={!this.state.enable}
                />
                <TextSetting
                    id='loginButtonText'
                    label={
                        <FormattedMessage
                            id='admin.saml.loginButtonTextTitle'
                            defaultMessage='Login Button Text:'
                        />
                    }
                    placeholder={Utils.localizeMessage('admin.saml.loginButtonTextEx', 'E.g.: "With OKTA"')}
                    helpText={
                        <FormattedMessage
                            id='admin.saml.loginButtonTextDesc'
                            defaultMessage='(Optional) The text that appears in the login button on the login page. Defaults to "With SAML".'
                        />
                    }
                    value={this.state.loginButtonText}
                    onChange={this.handleChange}
                    disabled={!this.state.enable}
                />
            </SettingsGroup>
        );
    }
}
