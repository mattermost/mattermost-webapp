// Copyright (c) 2016-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';

import {savePreference} from 'actions/user_actions.jsx';
import {Preferences} from 'utils/constants.jsx';
import {localizeMessage} from 'utils/utils.jsx';
import SettingItemMax from 'components/setting_item_max.jsx';
import SettingItemMin from 'components/setting_item_min.jsx';

export default class EmailNotificationSetting extends React.Component {
    static propTypes = {
        activeSection: PropTypes.string.isRequired,
        updateSection: PropTypes.func.isRequired,
        enableEmail: PropTypes.bool.isRequired,
        emailInterval: PropTypes.number.isRequired,
        onSubmit: PropTypes.func.isRequired,
        onCancel: PropTypes.func.isRequired,
        serverError: PropTypes.string,
        saving: PropTypes.bool,
        focused: PropTypes.bool,
        sendEmailNotifications: PropTypes.bool,
        enableEmailBatching: PropTypes.bool,
        siteName: PropTypes.string
    };

    constructor(props) {
        super(props);

        this.state = {
            enableEmail: props.enableEmail,
            emailInterval: props.emailInterval
        };
    }

    componentWillReceiveProps(nextProps) {
        if (!nextProps.saving && (nextProps.enableEmail !== this.props.enableEmail || nextProps.emailInterval !== this.props.emailInterval)) {
            this.setState({
                enableEmail: nextProps.enableEmail,
                emailInterval: nextProps.emailInterval
            });
        }
    }

    handleChange = (e) => {
        const enableEmail = e.currentTarget.getAttribute('data-enable-email');
        const emailInterval = parseInt(e.currentTarget.getAttribute('data-email-interval'), 10);
        this.setState({
            enableEmail,
            emailInterval
        });
    }

    handleSubmit = () => {
        const {enableEmail, emailInterval} = this.state;
        if (this.props.enableEmail !== enableEmail || this.props.emailInterval !== emailInterval) {
            // until the rest of the notification settings are moved to preferences, we have to do this separately
            savePreference(Preferences.CATEGORY_NOTIFICATIONS, Preferences.EMAIL_INTERVAL, emailInterval.toString());

            this.props.onSubmit(enableEmail);
        } else {
            this.props.updateSection('');
        }
    }

    handleUpdateSection = (section) => {
        if (section) {
            this.props.updateSection(section);
        } else {
            this.props.updateSection('');

            this.setState({
                enableEmail: this.props.enableEmail,
                emailInterval: this.props.emailInterval
            });
            this.props.onCancel();
        }
    }

    render() {
        if (!this.props.sendEmailNotifications && this.props.activeSection === 'email') {
            const inputs = [];

            inputs.push(
                <div
                    key='oauthEmailInfo'
                    className='padding-top'
                >
                    <FormattedMessage
                        id='user.settings.notifications.email.disabled_long'
                        defaultMessage='Email notifications have been disabled by your System Administrator.'
                    />
                </div>
            );

            return (
                <SettingItemMax
                    title={localizeMessage('user.settings.notifications.emailNotifications', 'Email notifications')}
                    inputs={inputs}
                    server_error={this.state.serverError}
                    section={'email'}
                    updateSection={this.handleUpdateSection}
                />
            );
        }

        if (this.props.activeSection !== 'email') {
            let description;

            if (!this.props.sendEmailNotifications) {
                description = (
                    <FormattedMessage
                        id='user.settings.notifications.email.disabled'
                        defaultMessage='Disabled by System Administrator'
                    />
                );
            } else if (this.props.enableEmail) {
                switch (this.state.emailInterval) {
                case Preferences.INTERVAL_IMMEDIATE:
                    description = (
                        <FormattedMessage
                            id='user.settings.notifications.email.immediately'
                            defaultMessage='Immediately'
                        />
                    );
                    break;
                case Preferences.INTERVAL_HOUR:
                    description = (
                        <FormattedMessage
                            id='user.settings.notifications.email.everyHour'
                            defaultMessage='Every hour'
                        />
                    );
                    break;
                default:
                    description = (
                        <FormattedMessage
                            id='user.settings.notifications.email.everyXMinutes'
                            defaultMessage='Every {count, plural, one {minute} other {{count, number} minutes}}'
                            values={{count: this.state.emailInterval / 60}}
                        />
                    );
                }
            } else {
                description = (
                    <FormattedMessage
                        id='user.settings.notifications.email.never'
                        defaultMessage='Never'
                    />
                );
            }

            return (
                <SettingItemMin
                    title={localizeMessage('user.settings.notifications.emailNotifications', 'Email notifications')}
                    describe={description}
                    focused={this.props.focused}
                    section={'email'}
                    updateSection={this.handleUpdateSection}
                />
            );
        }

        let batchingOptions = null;
        let batchingInfo = null;
        if (this.props.enableEmailBatching) {
            batchingOptions = (
                <div>
                    <div className='radio'>
                        <label>
                            <input
                                id='emailNotificationMinutes'
                                type='radio'
                                name='emailNotifications'
                                checked={this.state.emailInterval === Preferences.INTERVAL_FIFTEEN_MINUTES}
                                data-enable-email={'true'}
                                data-email-interval={Preferences.INTERVAL_FIFTEEN_MINUTES}
                                onChange={this.handleChange}
                            />
                            <FormattedMessage
                                id='user.settings.notifications.email.everyXMinutes'
                                defaultMessage='Every {count} minutes'
                                values={{count: Preferences.INTERVAL_FIFTEEN_MINUTES / 60}}
                            />
                        </label>
                    </div>
                    <div className='radio'>
                        <label>
                            <input
                                id='emailNotificationHour'
                                type='radio'
                                name='emailNotifications'
                                checked={this.state.emailInterval === Preferences.INTERVAL_HOUR}
                                data-enable-email={'true'}
                                data-email-interval={Preferences.INTERVAL_HOUR}
                                onChange={this.handleChange}
                            />
                            <FormattedMessage
                                id='user.settings.notifications.email.everyHour'
                                defaultMessage='Every hour'
                            />
                        </label>
                    </div>
                </div>
            );

            batchingInfo = (
                <FormattedMessage
                    id='user.settings.notifications.emailBatchingInfo'
                    defaultMessage='Notifications received over the time period selected are combined and sent in a single email.'
                />
            );
        }

        return (
            <SettingItemMax
                title={localizeMessage('user.settings.notifications.emailNotifications', 'Email notifications')}
                inputs={[
                    <div key='userNotificationEmailOptions'>
                        <label>
                            <FormattedMessage
                                id='user.settings.notifications.email.send'
                                defaultMessage='Send email notifications'
                            />
                        </label>
                        <div className='radio'>
                            <label>
                                <input
                                    id='emailNotificationImmediately'
                                    type='radio'
                                    name='emailNotifications'
                                    checked={this.state.emailInterval === Preferences.INTERVAL_IMMEDIATE}
                                    data-enable-email={'true'}
                                    data-email-interval={Preferences.INTERVAL_IMMEDIATE}
                                    onChange={this.handleChange}
                                />
                                <FormattedMessage
                                    id='user.settings.notifications.email.immediately'
                                    defaultMessage='Immediately'
                                />
                            </label>
                        </div>
                        {batchingOptions}
                        <div className='radio'>
                            <label>
                                <input
                                    id='emailNotificationNever'
                                    type='radio'
                                    name='emailNotifications'
                                    checked={this.state.emailInterval === Preferences.INTERVAL_NEVER}
                                    data-enable-email={'false'}
                                    data-email-interval={Preferences.INTERVAL_NEVER}
                                    onChange={this.handleChange}
                                />
                                <FormattedMessage
                                    id='user.settings.notifications.email.never'
                                    defaultMessage='Never'
                                />
                            </label>
                        </div>
                        <br/>
                        <div>
                            <FormattedMessage
                                id='user.settings.notifications.emailInfo'
                                defaultMessage='Email notifications are sent for mentions and direct messages when you are offline or away from {siteName} for more than 5 minutes.'
                                values={{
                                    siteName: this.props.siteName
                                }}
                            />
                            {' '}
                            {batchingInfo}
                        </div>
                    </div>
                ]}
                submit={this.handleSubmit}
                saving={this.props.saving}
                server_error={this.props.serverError}
                updateSection={this.handleUpdateSection}
            />
        );
    }
}
