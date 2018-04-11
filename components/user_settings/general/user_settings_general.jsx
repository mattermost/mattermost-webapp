// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {defineMessages, FormattedDate, FormattedHTMLMessage, FormattedMessage, injectIntl, intlShape} from 'react-intl';

import {trackEvent} from 'actions/diagnostics_actions.jsx';
import {updateUser, uploadProfileImage} from 'actions/user_actions.jsx';
import ErrorStore from 'stores/error_store.jsx';
import UserStore from 'stores/user_store.jsx';
import Constants from 'utils/constants.jsx';
import * as Utils from 'utils/utils.jsx';
import SettingItemMax from 'components/setting_item_max.jsx';
import SettingItemMin from 'components/setting_item_min.jsx';
import SettingPicture from 'components/setting_picture.jsx';

const holders = defineMessages({
    usernameReserved: {
        id: 'user.settings.general.usernameReserved',
        defaultMessage: 'This username is reserved, please choose a new one.',
    },
    usernameRestrictions: {
        id: 'user.settings.general.usernameRestrictions',
        defaultMessage: "Username must begin with a letter, and contain between {min} to {max} lowercase characters made up of numbers, letters, and the symbols '.', '-', and '_'.",
    },
    validEmail: {
        id: 'user.settings.general.validEmail',
        defaultMessage: 'Please enter a valid email address.',
    },
    emailMatch: {
        id: 'user.settings.general.emailMatch',
        defaultMessage: 'The new emails you entered do not match.',
    },
    checkEmail: {
        id: 'user.settings.general.checkEmail',
        defaultMessage: 'Check your email at {email} to verify the address.',
    },
    validImage: {
        id: 'user.settings.general.validImage',
        defaultMessage: 'Only BMP, JPG or PNG images may be used for profile pictures',
    },
    imageTooLarge: {
        id: 'user.settings.general.imageTooLarge',
        defaultMessage: 'Unable to upload profile image. File is too large.',
    },
    uploadImage: {
        id: 'user.settings.general.uploadImage',
        defaultMessage: "Click 'Edit' to upload an image.",
    },
    uploadImageMobile: {
        id: 'user.settings.general.mobile.uploadImage',
        defaultMessage: 'Click to upload an image.',
    },
    fullName: {
        id: 'user.settings.general.fullName',
        defaultMessage: 'Full Name',
    },
    nickname: {
        id: 'user.settings.general.nickname',
        defaultMessage: 'Nickname',
    },
    username: {
        id: 'user.settings.general.username',
        defaultMessage: 'Username',
    },
    profilePicture: {
        id: 'user.settings.general.profilePicture',
        defaultMessage: 'Profile Picture',
    },
    close: {
        id: 'user.settings.general.close',
        defaultMessage: 'Close',
    },
    position: {
        id: 'user.settings.general.position',
        defaultMessage: 'Position',
    },
});

const prevSections = {
    name: 'dummySectionName', // dummy value that should never match any section name
    username: 'name',
    nickname: 'username',
    position: 'nickname',
    email: 'position',
    picture: 'email',
};

const ACCEPTED_PROFILE_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/bmp'];

class UserSettingsGeneralTab extends React.Component {
    static propTypes = {
        intl: intlShape.isRequired,
        user: PropTypes.object.isRequired,
        updateSection: PropTypes.func.isRequired,
        updateTab: PropTypes.func.isRequired,
        activeSection: PropTypes.string.isRequired,
        prevActiveSection: PropTypes.string.isRequired,
        closeModal: PropTypes.func.isRequired,
        collapseModal: PropTypes.func.isRequired,
        actions: PropTypes.shape({
            getMe: PropTypes.func.isRequired,
        }).isRequired,
        sendEmailNotifications: PropTypes.bool,
        requireEmailVerification: PropTypes.bool,
        maxFileSize: PropTypes.number,
        ldapFirstNameAttributeSet: PropTypes.bool,
        ldapLastNameAttributeSet: PropTypes.bool,
        samlFirstNameAttributeSet: PropTypes.bool,
        samlLastNameAttributeSet: PropTypes.bool,
        ldapNicknameAttributeSet: PropTypes.bool,
        samlNicknameAttributeSet: PropTypes.bool,
        positionAttributeSet: PropTypes.bool,
    }

    constructor(props) {
        super(props);
        this.submitActive = false;

        this.state = this.setupInitialState(props);
    }

    submitUsername = () => {
        const user = Object.assign({}, this.props.user);
        const username = this.state.username.trim().toLowerCase();

        const {formatMessage} = this.props.intl;
        const usernameError = Utils.isValidUsername(username);
        if (usernameError === 'Cannot use a reserved word as a username.') {
            this.setState({clientError: formatMessage(holders.usernameReserved), serverError: ''});
            return;
        } else if (usernameError) {
            this.setState({clientError: formatMessage(holders.usernameRestrictions, {min: Constants.MIN_USERNAME_LENGTH, max: Constants.MAX_USERNAME_LENGTH}), serverError: ''});
            return;
        }

        if (user.username === username) {
            this.updateSection('');
            return;
        }

        user.username = username;

        trackEvent('settings', 'user_settings_update', {field: 'username'});

        this.submitUser(user, false);
    }

    submitNickname = () => {
        const user = Object.assign({}, this.props.user);
        const nickname = this.state.nickname.trim();

        if (user.nickname === nickname) {
            this.updateSection('');
            return;
        }

        user.nickname = nickname;

        trackEvent('settings', 'user_settings_update', {field: 'username'});

        this.submitUser(user, false);
    }

    submitName = () => {
        const user = Object.assign({}, this.props.user);
        const firstName = this.state.firstName.trim();
        const lastName = this.state.lastName.trim();

        if (user.first_name === firstName && user.last_name === lastName) {
            this.updateSection('');
            return;
        }

        user.first_name = firstName;
        user.last_name = lastName;

        trackEvent('settings', 'user_settings_update', {field: 'fullname'});

        this.submitUser(user, false);
    }

    submitEmail = () => {
        const user = Object.assign({}, this.props.user);
        const email = this.state.email.trim().toLowerCase();
        const confirmEmail = this.state.confirmEmail.trim().toLowerCase();

        const {formatMessage} = this.props.intl;

        if (email === user.email && (confirmEmail === '' || confirmEmail === user.email)) {
            this.updateSection('');
            return;
        }

        if (email === '' || !Utils.isEmail(email)) {
            this.setState({emailError: formatMessage(holders.validEmail), clientError: '', serverError: ''});
            return;
        }

        if (email !== confirmEmail) {
            this.setState({emailError: formatMessage(holders.emailMatch), clientError: '', serverError: ''});
            return;
        }

        user.email = email;
        trackEvent('settings', 'user_settings_update', {field: 'email'});
        this.submitUser(user, true);
    }

    submitUser = (user, emailUpdated) => {
        this.setState({sectionIsSaving: true});

        updateUser(
            user,
            () => {
                this.updateSection('');
                this.props.actions.getMe();
                const verificationEnabled = this.props.sendEmailNotifications && this.props.requireEmailVerification && emailUpdated;

                if (verificationEnabled) {
                    ErrorStore.storeLastError({message: this.props.intl.formatMessage(holders.checkEmail, {email: user.email})});
                    ErrorStore.emitChange();
                    this.setState({emailChangeInProgress: true});
                }
            },
            (err) => {
                let serverError;
                if (err.message) {
                    serverError = err.message;
                } else {
                    serverError = err;
                }
                this.setState({serverError, emailError: '', clientError: '', sectionIsSaving: false});
            }
        );
    }

    submitPicture = (e) => {
        e.preventDefault();

        if (!this.state.pictureFile) {
            return;
        }

        if (!this.submitActive) {
            return;
        }

        trackEvent('settings', 'user_settings_update', {field: 'picture'});

        const {formatMessage} = this.props.intl;
        const file = this.state.pictureFile;

        if (!ACCEPTED_PROFILE_IMAGE_TYPES.includes(file.type)) {
            this.setState({clientError: formatMessage(holders.validImage), serverError: ''});
            return;
        } else if (file.size > this.props.maxFileSize) {
            this.setState({clientError: formatMessage(holders.imageTooLarge), serverError: ''});
            return;
        }

        this.setState({loadingPicture: true});

        uploadProfileImage(
            file,
            () => {
                this.updateSection('');
                this.submitActive = false;
            },
            (err) => {
                var state = this.setupInitialState(this.props);
                state.serverError = err.message;
                this.setState(state);
            }
        );
    }

    submitPosition = () => {
        const user = Object.assign({}, this.props.user);
        const position = this.state.position.trim();

        if (user.position === position) {
            this.updateSection('');
            return;
        }

        user.position = position;

        trackEvent('settings', 'user_settings_update', {field: 'position'});

        this.submitUser(user, false);
    }

    updateUsername = (e) => {
        this.setState({username: e.target.value});
    }

    updateFirstName = (e) => {
        this.setState({firstName: e.target.value});
    }

    updateLastName = (e) => {
        this.setState({lastName: e.target.value});
    }

    updateNickname = (e) => {
        this.setState({nickname: e.target.value});
    }

    updatePosition = (e) => {
        this.setState({position: e.target.value});
    }

    updateEmail = (e) => {
        this.setState({email: e.target.value});
    }

    updateConfirmEmail = (e) => {
        this.setState({confirmEmail: e.target.value});
    }

    updatePicture = (e) => {
        if (e.target.files && e.target.files[0]) {
            this.setState({pictureFile: e.target.files[0]});

            this.submitActive = true;
            this.setState({clientError: null});
        } else {
            this.setState({pictureFile: null});
        }
    }

    updateSection = (section) => {
        const emailChangeInProgress = this.state.emailChangeInProgress;
        this.setState(Object.assign({}, this.setupInitialState(this.props), {emailChangeInProgress, clientError: '', serverError: '', emailError: '', sectionIsSaving: false}));
        this.submitActive = false;
        this.props.updateSection(section);
    }

    setupInitialState(props) {
        const user = props.user;

        return {
            username: user.username,
            firstName: user.first_name,
            lastName: user.last_name,
            nickname: user.nickname,
            position: user.position,
            originalEmail: user.email,
            email: '',
            confirmEmail: '',
            pictureFile: null,
            loadingPicture: false,
            emailChangeInProgress: false,
            sectionIsSaving: false,
        };
    }

    createEmailSection() {
        let emailSection;

        if (this.props.activeSection === 'email') {
            const emailEnabled = this.props.sendEmailNotifications;
            const emailVerificationEnabled = this.props.requireEmailVerification;
            const inputs = [];

            let helpText = (
                <FormattedMessage
                    id='user.settings.general.emailHelp1'
                    defaultMessage='Email is used for sign-in, notifications, and password reset. Email requires verification if changed.'
                />
            );

            if (!emailEnabled) {
                helpText = (
                    <div className='setting-list__hint col-sm-12 text-danger'>
                        <FormattedMessage
                            id='user.settings.general.emailHelp2'
                            defaultMessage='Email has been disabled by your System Administrator. No notification emails will be sent until it is enabled.'
                        />
                    </div>
                );
            } else if (!emailVerificationEnabled) {
                helpText = (
                    <FormattedMessage
                        id='user.settings.general.emailHelp3'
                        defaultMessage='Email is used for sign-in, notifications, and password reset.'
                    />
                );
            } else if (this.state.emailChangeInProgress) {
                const newEmail = UserStore.getCurrentUser().email;
                if (newEmail) {
                    helpText = (
                        <FormattedMessage
                            id='user.settings.general.emailHelp4'
                            defaultMessage='A verification email was sent to {email}.'
                            values={{
                                email: newEmail,
                            }}
                        />
                    );
                }
            }

            let submit = null;

            if (this.props.user.auth_service === '') {
                inputs.push(
                    <div key='currentEmailSetting'>
                        <div className='form-group'>
                            <label className='col-sm-5 control-label'>
                                <FormattedMessage
                                    id='user.settings.general.currentEmail'
                                    defaultMessage='Current Email'
                                />
                            </label>
                            <div className='col-sm-7'>
                                <label className='control-label'>{this.state.originalEmail}</label>
                            </div>
                        </div>
                    </div>
                );

                inputs.push(
                    <div key='emailSetting'>
                        <div className='form-group'>
                            <label className='col-sm-5 control-label'>
                                <FormattedMessage
                                    id='user.settings.general.newEmail'
                                    defaultMessage='New Email'
                                />
                            </label>
                            <div className='col-sm-7'>
                                <input
                                    autoFocus={true}
                                    id='primaryEmail'
                                    className='form-control'
                                    type='email'
                                    onChange={this.updateEmail}
                                    value={this.state.email}
                                />
                            </div>
                        </div>
                    </div>
                );

                inputs.push(
                    <div key='confirmEmailSetting'>
                        <div className='form-group'>
                            <label className='col-sm-5 control-label'>
                                <FormattedMessage
                                    id='user.settings.general.confirmEmail'
                                    defaultMessage='Confirm Email'
                                />
                            </label>
                            <div className='col-sm-7'>
                                <input
                                    id='confirmEmail'
                                    className='form-control'
                                    type='email'
                                    onChange={this.updateConfirmEmail}
                                    value={this.state.confirmEmail}
                                />
                            </div>
                        </div>
                        {helpText}
                    </div>
                );

                submit = this.submitEmail;
            } else if (this.props.user.auth_service === Constants.GITLAB_SERVICE) {
                inputs.push(
                    <div
                        key='oauthEmailInfo'
                        className='form-group'
                    >
                        <div className='setting-list__hint col-sm-12'>
                            <FormattedMessage
                                id='user.settings.general.emailGitlabCantUpdate'
                                defaultMessage='Login occurs through GitLab. Email cannot be updated. Email address used for notifications is {email}.'
                                values={{
                                    email: this.state.originalEmail,
                                }}
                            />
                        </div>
                        {helpText}
                    </div>
                );
            } else if (this.props.user.auth_service === Constants.GOOGLE_SERVICE) {
                inputs.push(
                    <div
                        key='oauthEmailInfo'
                        className='form-group'
                    >
                        <div className='setting-list__hint col-sm-12'>
                            <FormattedMessage
                                id='user.settings.general.emailGoogleCantUpdate'
                                defaultMessage='Login occurs through Google Apps. Email cannot be updated. Email address used for notifications is {email}.'
                                values={{
                                    email: this.state.originalEmail,
                                }}
                            />
                        </div>
                        {helpText}
                    </div>
                );
            } else if (this.props.user.auth_service === Constants.OFFICE365_SERVICE) {
                inputs.push(
                    <div
                        key='oauthEmailInfo'
                        className='form-group'
                    >
                        <div className='setting-list__hint col-sm-12'>
                            <FormattedMessage
                                id='user.settings.general.emailOffice365CantUpdate'
                                defaultMessage='Login occurs through Office 365. Email cannot be updated. Email address used for notifications is {email}.'
                                values={{
                                    email: this.state.originalEmail,
                                }}
                            />
                        </div>
                        {helpText}
                    </div>
                );
            } else if (this.props.user.auth_service === Constants.LDAP_SERVICE) {
                inputs.push(
                    <div
                        key='oauthEmailInfo'
                        className='padding-bottom'
                    >
                        <div className='setting-list__hint col-sm-12'>
                            <FormattedMessage
                                id='user.settings.general.emailLdapCantUpdate'
                                defaultMessage='Login occurs through AD/LDAP. Email cannot be updated. Email address used for notifications is {email}.'
                                values={{
                                    email: this.state.originalEmail,
                                }}
                            />
                        </div>
                    </div>
                );
            } else if (this.props.user.auth_service === Constants.SAML_SERVICE) {
                inputs.push(
                    <div
                        key='oauthEmailInfo'
                        className='padding-bottom'
                    >
                        <div className='setting-list__hint col-sm-12'>
                            <FormattedMessage
                                id='user.settings.general.emailSamlCantUpdate'
                                defaultMessage='Login occurs through SAML. Email cannot be updated. Email address used for notifications is {email}.'
                                values={{
                                    email: this.state.originalEmail,
                                }}
                            />
                        </div>
                        {helpText}
                    </div>
                );
            }

            emailSection = (
                <SettingItemMax
                    title={
                        <FormattedMessage
                            id='user.settings.general.email'
                            defaultMessage='Email'
                        />
                    }
                    inputs={inputs}
                    submit={submit}
                    saving={this.state.sectionIsSaving}
                    serverError={this.state.serverError}
                    clientError={this.state.emailError}
                    updateSection={this.updateSection}
                />
            );
        } else {
            let describe = '';
            if (this.props.user.auth_service === '') {
                if (this.state.emailChangeInProgress) {
                    const newEmail = UserStore.getCurrentUser().email;
                    if (newEmail) {
                        describe = (
                            <FormattedHTMLMessage
                                id='user.settings.general.newAddress'
                                defaultMessage='New Address: {email}<br />Check your email to verify the above address.'
                                values={{
                                    email: newEmail,
                                }}
                            />
                        );
                    } else {
                        describe = (
                            <FormattedMessage
                                id='user.settings.general.checkEmailNoAddress'
                                defaultMessage='Check your email to verify your new address'
                            />
                        );
                    }
                } else {
                    describe = UserStore.getCurrentUser().email;
                }
            } else if (this.props.user.auth_service === Constants.GITLAB_SERVICE) {
                describe = (
                    <FormattedMessage
                        id='user.settings.general.loginGitlab'
                        defaultMessage='Login done through GitLab ({email})'
                        values={{
                            email: this.state.originalEmail,
                        }}
                    />
                );
            } else if (this.props.user.auth_service === Constants.GOOGLE_SERVICE) {
                describe = (
                    <FormattedMessage
                        id='user.settings.general.loginGoogle'
                        defaultMessage='Login done through Google Apps ({email})'
                        values={{
                            email: this.state.originalEmail,
                        }}
                    />
                );
            } else if (this.props.user.auth_service === Constants.OFFICE365_SERVICE) {
                describe = (
                    <FormattedMessage
                        id='user.settings.general.loginOffice365'
                        defaultMessage='Login done through Office 365 ({email})'
                        values={{
                            email: this.state.originalEmail,
                        }}
                    />
                );
            } else if (this.props.user.auth_service === Constants.LDAP_SERVICE) {
                describe = (
                    <FormattedMessage
                        id='user.settings.general.loginLdap'
                        defaultMessage='Login done through AD/LDAP ({email})'
                        values={{
                            email: this.state.originalEmail,
                        }}
                    />
                );
            } else if (this.props.user.auth_service === Constants.SAML_SERVICE) {
                describe = (
                    <FormattedMessage
                        id='user.settings.general.loginSaml'
                        defaultMessage='Login done through SAML ({email})'
                        values={{
                            email: this.state.originalEmail,
                        }}
                    />
                );
            }

            emailSection = (
                <SettingItemMin
                    title={
                        <FormattedMessage
                            id='user.settings.general.email'
                            defaultMessage='Email'
                        />
                    }
                    describe={describe}
                    focused={this.props.prevActiveSection === prevSections.email}
                    section={'email'}
                    updateSection={this.updateSection}
                />
            );
        }

        return emailSection;
    }

    render() {
        const user = this.props.user;
        const {formatMessage} = this.props.intl;

        let clientError = null;
        if (this.state.clientError) {
            clientError = this.state.clientError;
        }
        let serverError = null;
        if (this.state.serverError) {
            serverError = this.state.serverError;
        }

        let nameSection;
        const inputs = [];

        if (this.props.activeSection === 'name') {
            let extraInfo;
            let submit = null;
            if (
                (this.props.user.auth_service === 'ldap' &&
                    (this.props.ldapFirstNameAttributeSet || this.props.ldapLastNameAttributeSet)) ||
                (this.props.user.auth_service === Constants.SAML_SERVICE &&
                    (this.props.samlFirstNameAttributeSet || this.props.samlLastNameAttributeSet))
            ) {
                extraInfo = (
                    <span>
                        <FormattedMessage
                            id='user.settings.general.field_handled_externally'
                            defaultMessage='This field is handled through your login provider. If you want to change it, you need to do so through your login provider.'
                        />
                    </span>
                );
            } else {
                inputs.push(
                    <div
                        key='firstNameSetting'
                        className='form-group'
                    >
                        <label className='col-sm-5 control-label'>
                            <FormattedMessage
                                id='user.settings.general.firstName'
                                defaultMessage='First Name'
                            />
                        </label>
                        <div className='col-sm-7'>
                            <input
                                id='firstName'
                                autoFocus={true}
                                className='form-control'
                                type='text'
                                onChange={this.updateFirstName}
                                value={this.state.firstName}
                                onFocus={Utils.moveCursorToEnd}
                            />
                        </div>
                    </div>
                );

                inputs.push(
                    <div
                        key='lastNameSetting'
                        className='form-group'
                    >
                        <label className='col-sm-5 control-label'>
                            <FormattedMessage
                                id='user.settings.general.lastName'
                                defaultMessage='Last Name'
                            />
                        </label>
                        <div className='col-sm-7'>
                            <input
                                id='lastName'
                                className='form-control'
                                type='text'
                                onChange={this.updateLastName}
                                value={this.state.lastName}
                            />
                        </div>
                    </div>
                );

                function notifClick(e) {
                    e.preventDefault();
                    this.updateSection('');
                    this.props.updateTab('notifications');
                }

                const notifLink = (
                    <a
                        href='#'
                        onClick={notifClick.bind(this)}
                    >
                        <FormattedMessage
                            id='user.settings.general.notificationsLink'
                            defaultMessage='Notifications'
                        />
                    </a>
                );

                extraInfo = (
                    <span>
                        <FormattedMessage
                            id='user.settings.general.notificationsExtra'
                            defaultMessage='By default, you will receive mention notifications when someone types your first name. Go to {notify} settings to change this default.'
                            values={{
                                notify: (notifLink),
                            }}
                        />
                    </span>
                );

                submit = this.submitName;
            }

            nameSection = (
                <SettingItemMax
                    title={formatMessage(holders.fullName)}
                    inputs={inputs}
                    submit={submit}
                    saving={this.state.sectionIsSaving}
                    serverError={serverError}
                    clientError={clientError}
                    updateSection={this.updateSection}
                    extraInfo={extraInfo}
                />
            );
        } else {
            let describe = '';

            if (user.first_name && user.last_name) {
                describe = user.first_name + ' ' + user.last_name;
            } else if (user.first_name) {
                describe = user.first_name;
            } else if (user.last_name) {
                describe = user.last_name;
            } else {
                describe = (
                    <FormattedMessage
                        id='user.settings.general.emptyName'
                        defaultMessage="Click 'Edit' to add your full name"
                    />
                );
                if (Utils.isMobile()) {
                    describe = (
                        <FormattedMessage
                            id='user.settings.general.mobile.emptyName'
                            defaultMessage='Click to add your full name'
                        />
                    );
                }
            }

            nameSection = (
                <SettingItemMin
                    title={formatMessage(holders.fullName)}
                    describe={describe}
                    focused={this.props.prevActiveSection === prevSections.name}
                    section={'name'}
                    updateSection={this.updateSection}
                />
            );
        }

        let nicknameSection;
        if (this.props.activeSection === 'nickname') {
            let extraInfo;
            let submit = null;
            if ((this.props.user.auth_service === 'ldap' && this.props.ldapNicknameAttributeSet) || (this.props.user.auth_service === Constants.SAML_SERVICE && this.props.samlNicknameAttributeSet)) {
                extraInfo = (
                    <span>
                        <FormattedMessage
                            id='user.settings.general.field_handled_externally'
                            defaultMessage='This field is handled through your login provider. If you want to change it, you need to do so though your login provider.'
                        />
                    </span>
                );
            } else {
                let nicknameLabel = (
                    <FormattedMessage
                        id='user.settings.general.nickname'
                        defaultMessage='Nickname'
                    />
                );
                if (Utils.isMobile()) {
                    nicknameLabel = '';
                }

                inputs.push(
                    <div
                        key='nicknameSetting'
                        className='form-group'
                    >
                        <label className='col-sm-5 control-label'>{nicknameLabel}</label>
                        <div className='col-sm-7'>
                            <input
                                id='nickname'
                                autoFocus={true}
                                className='form-control'
                                type='text'
                                onChange={this.updateNickname}
                                value={this.state.nickname}
                                maxLength={Constants.MAX_NICKNAME_LENGTH}
                                autoCapitalize='off'
                            />
                        </div>
                    </div>
                );

                extraInfo = (
                    <span>
                        <FormattedMessage
                            id='user.settings.general.nicknameExtra'
                            defaultMessage='Use Nickname for a name you might be called that is different from your first name and username. This is most often used when two or more people have similar sounding names and usernames.'
                        />
                    </span>
                );

                submit = this.submitNickname;
            }

            nicknameSection = (
                <SettingItemMax
                    title={formatMessage(holders.nickname)}
                    inputs={inputs}
                    submit={submit}
                    saving={this.state.sectionIsSaving}
                    serverError={serverError}
                    clientError={clientError}
                    updateSection={this.updateSection}
                    extraInfo={extraInfo}
                />
            );
        } else {
            let describe = '';
            if (user.nickname) {
                describe = user.nickname;
            } else {
                describe = (
                    <FormattedMessage
                        id='user.settings.general.emptyNickname'
                        defaultMessage="Click 'Edit' to add a nickname"
                    />
                );
                if (Utils.isMobile()) {
                    describe = (
                        <FormattedMessage
                            id='user.settings.general.mobile.emptyNickname'
                            defaultMessage='Click to add a nickname'
                        />
                    );
                }
            }

            nicknameSection = (
                <SettingItemMin
                    title={formatMessage(holders.nickname)}
                    describe={describe}
                    focused={this.props.prevActiveSection === prevSections.nickname}
                    section={'nickname'}
                    updateSection={this.updateSection}
                />
            );
        }

        let usernameSection;
        if (this.props.activeSection === 'username') {
            let extraInfo;
            let submit = null;
            if (this.props.user.auth_service === '') {
                let usernameLabel = (
                    <FormattedMessage
                        id='user.settings.general.username'
                        defaultMessage='Username'
                    />
                );
                if (Utils.isMobile()) {
                    usernameLabel = '';
                }

                inputs.push(
                    <div
                        key='usernameSetting'
                        className='form-group'
                    >
                        <label className='col-sm-5 control-label'>{usernameLabel}</label>
                        <div className='col-sm-7'>
                            <input
                                id='username'
                                autoFocus={true}
                                maxLength={Constants.MAX_USERNAME_LENGTH}
                                className='form-control'
                                type='text'
                                onChange={this.updateUsername}
                                value={this.state.username}
                                autoCapitalize='off'
                                onFocus={Utils.moveCursorToEnd}
                            />
                        </div>
                    </div>
                );

                extraInfo = (
                    <span>
                        <FormattedMessage
                            id='user.settings.general.usernameInfo'
                            defaultMessage='Pick something easy for teammates to recognize and recall.'
                        />
                    </span>
                );

                submit = this.submitUsername;
            } else {
                extraInfo = (
                    <span>
                        <FormattedMessage
                            id='user.settings.general.field_handled_externally'
                            defaultMessage='This field is handled through your login provider. If you want to change it, you need to do so though your login provider.'
                        />
                    </span>
                );
            }

            usernameSection = (
                <SettingItemMax
                    title={formatMessage(holders.username)}
                    inputs={inputs}
                    submit={submit}
                    saving={this.state.sectionIsSaving}
                    serverError={serverError}
                    clientError={clientError}
                    updateSection={this.updateSection}
                    extraInfo={extraInfo}
                />
            );
        } else {
            usernameSection = (
                <SettingItemMin
                    title={formatMessage(holders.username)}
                    describe={UserStore.getCurrentUser().username}
                    focused={this.props.prevActiveSection === prevSections.username}
                    section={'username'}
                    updateSection={this.updateSection}
                />
            );
        }

        let positionSection;
        if (this.props.activeSection === 'position') {
            let extraInfo;
            let submit = null;
            if ((this.props.user.auth_service === 'ldap' || this.props.user.auth_service === Constants.SAML_SERVICE) && this.props.positionAttributeSet) {
                extraInfo = (
                    <span>
                        <FormattedMessage
                            id='user.settings.general.field_handled_externally'
                            defaultMessage='This field is handled through your login provider. If you want to change it, you need to do so though your login provider.'
                        />
                    </span>
                );
            } else {
                let positionLabel = (
                    <FormattedMessage
                        id='user.settings.general.position'
                        defaultMessage='Position'
                    />
                );
                if (Utils.isMobile()) {
                    positionLabel = '';
                }

                inputs.push(
                    <div
                        key='positionSetting'
                        className='form-group'
                    >
                        <label className='col-sm-5 control-label'>{positionLabel}</label>
                        <div className='col-sm-7'>
                            <input
                                id='position'
                                autoFocus={true}
                                className='form-control'
                                type='text'
                                onChange={this.updatePosition}
                                value={this.state.position}
                                maxLength={Constants.MAX_POSITION_LENGTH}
                                autoCapitalize='off'
                                onFocus={Utils.moveCursorToEnd}
                            />
                        </div>
                    </div>
                );

                extraInfo = (
                    <span>
                        <FormattedMessage
                            id='user.settings.general.positionExtra'
                            defaultMessage='Use Position for your role or job title. This will be shown in your profile popover.'
                        />
                    </span>
                );

                submit = this.submitPosition;
            }

            positionSection = (
                <SettingItemMax
                    title={formatMessage(holders.position)}
                    inputs={inputs}
                    submit={submit}
                    saving={this.state.sectionIsSaving}
                    serverError={serverError}
                    clientError={clientError}
                    updateSection={this.updateSection}
                    extraInfo={extraInfo}
                />
            );
        } else {
            let describe = '';
            if (user.position) {
                describe = user.position;
            } else {
                describe = (
                    <FormattedMessage
                        id='user.settings.general.emptyPosition'
                        defaultMessage="Click 'Edit' to add your job title / position"
                    />
                );
                if (Utils.isMobile()) {
                    describe = (
                        <FormattedMessage
                            id='user.settings.general.mobile.emptyPosition'
                            defaultMessage='Click to add your job title / position'
                        />
                    );
                }
            }

            positionSection = (
                <SettingItemMin
                    title={formatMessage(holders.position)}
                    describe={describe}
                    focused={this.props.prevActiveSection === prevSections.position}
                    section={'position'}
                    updateSection={this.updateSection}
                />
            );
        }

        const emailSection = this.createEmailSection();

        let pictureSection;
        if (this.props.activeSection === 'picture') {
            pictureSection = (
                <SettingPicture
                    title={formatMessage(holders.profilePicture)}
                    submit={this.submitPicture}
                    src={Utils.imageURLForUser(user)}
                    serverError={serverError}
                    clientError={clientError}
                    updateSection={(e) => {
                        this.updateSection('');
                        e.preventDefault();
                    }}
                    file={this.state.pictureFile}
                    onFileChange={this.updatePicture}
                    submitActive={this.submitActive}
                    loadingPicture={this.state.loadingPicture}
                />
            );
        } else {
            let minMessage = formatMessage(holders.uploadImage);
            if (Utils.isMobile()) {
                minMessage = formatMessage(holders.uploadImageMobile);
            }
            if (user.last_picture_update) {
                minMessage = (
                    <FormattedMessage
                        id='user.settings.general.imageUpdated'
                        defaultMessage='Image last updated {date}'
                        values={{
                            date: (
                                <FormattedDate
                                    value={new Date(user.last_picture_update)}
                                    day='2-digit'
                                    month='short'
                                    year='numeric'
                                />
                            ),
                        }}
                    />
                );
            }
            pictureSection = (
                <SettingItemMin
                    title={formatMessage(holders.profilePicture)}
                    describe={minMessage}
                    focused={this.props.prevActiveSection === prevSections.picture}
                    section={'picture'}
                    updateSection={this.updateSection}
                />
            );
        }

        return (
            <div>
                <div className='modal-header'>
                    <button
                        id='closeUserSettings'
                        type='button'
                        className='close'
                        data-dismiss='modal'
                        aria-label={formatMessage(holders.close)}
                        onClick={this.props.closeModal}
                    >
                        <span aria-hidden='true'>{'×'}</span>
                    </button>
                    <h4
                        className='modal-title'
                        ref='title'
                    >
                        <div className='modal-back'>
                            <i
                                className='fa fa-angle-left'
                                onClick={this.props.collapseModal}
                            />
                        </div>
                        <FormattedMessage
                            id='user.settings.general.title'
                            defaultMessage='General Settings'
                        />
                    </h4>
                </div>
                <div className='user-settings'>
                    <h3 className='tab-header'>
                        <FormattedMessage
                            id='user.settings.general.title'
                            defaultMessage='General Settings'
                        />
                    </h3>
                    <div className='divider-dark first'/>
                    {nameSection}
                    <div className='divider-light'/>
                    {usernameSection}
                    <div className='divider-light'/>
                    {nicknameSection}
                    <div className='divider-light'/>
                    {positionSection}
                    <div className='divider-light'/>
                    {emailSection}
                    <div className='divider-light'/>
                    {pictureSection}
                    <div className='divider-dark'/>
                </div>
            </div>
        );
    }
}

export default injectIntl(UserSettingsGeneralTab);
