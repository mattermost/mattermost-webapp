// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';

import {getEmailInterval} from 'mattermost-redux/utils/notify_props';

import {Preferences} from 'utils/constants.jsx';
import {localizeMessage} from 'utils/utils.jsx';
import SettingItemMax from 'components/setting_item_max.jsx';
import SettingItemMin from 'components/setting_item_min.jsx';

const SECONDS_PER_MINUTE = 60;

export default class EmailNotificationSetting extends React.Component {
    static propTypes = {
        currentUserId: PropTypes.string.isRequired,
        activeSection: PropTypes.string.isRequired,
        updateSection: PropTypes.func.isRequired,
        enableEmail: PropTypes.bool.isRequired,
        emailInterval: PropTypes.number.isRequired,
        onSubmit: PropTypes.func.isRequired,
        onCancel: PropTypes.func.isRequired,
        onChange: PropTypes.func.isRequired,
        serverError: PropTypes.string,
        saving: PropTypes.bool,
        focused: PropTypes.bool,
        sendEmailNotifications: PropTypes.bool,
        enableEmailBatching: PropTypes.bool,
        siteName: PropTypes.string,
        actions: PropTypes.shape({
            savePreferences: PropTypes.func.isRequired,
        }).isRequired,
    };

    constructor(props) {
        super(props);

        const {
            emailInterval,
            enableEmail,
            enableEmailBatching,
            sendEmailNotifications,
        } = props;

        this.state = {
            emailInterval,
            enableEmailBatching,
            sendEmailNotifications,
            newInterval: getEmailInterval(enableEmail && sendEmailNotifications, enableEmailBatching, emailInterval),
        };
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        const {
            emailInterval,
            enableEmail,
            enableEmailBatching,
            sendEmailNotifications,
        } = nextProps;

        if (sendEmailNotifications !== prevState.sendEmailNotifications ||
            enableEmailBatching !== prevState.enableEmailBatching ||
            emailInterval !== prevState.emailInterval
        ) {
            return {
                emailInterval,
                enableEmailBatching,
                sendEmailNotifications,
                newInterval: getEmailInterval(enableEmail && sendEmailNotifications, enableEmailBatching, emailInterval),
            };
        }

        return null;
    }

    handleChange = (e) => {
        const enableEmail = e.currentTarget.getAttribute('data-enable-email');

        this.setState({
            enableEmail,
            newInterval: parseInt(e.currentTarget.getAttribute('data-email-interval'), 10),
        });

        this.props.onChange(enableEmail);
    }

    handleSubmit = async () => {
        const {newInterval} = this.state;
        if (this.props.emailInterval === newInterval) {
            this.props.updateSection('');
        } else {
            // until the rest of the notification settings are moved to preferences, we have to do this separately
            const {currentUserId, actions} = this.props;
            const emailIntervalPreference = {
                user_id: currentUserId,
                category: Preferences.CATEGORY_NOTIFICATIONS,
                name: Preferences.EMAIL_INTERVAL,
                value: newInterval.toString(),
            };

            await actions.savePreferences(currentUserId, [emailIntervalPreference]);

            this.props.onSubmit();
        }
    }

    handleUpdateSection = (section) => {
        if (section) {
            this.props.updateSection(section);
        } else {
            this.props.updateSection('');

            this.setState({
                enableEmail: this.props.enableEmail,
                newInterval: this.props.emailInterval,
            });
            this.props.onCancel();
        }
    }

    renderMinSettingView = () => {
        const {
            enableEmail,
            focused,
            sendEmailNotifications,
        } = this.props;

        const {newInterval} = this.state;

        let description;
        if (!sendEmailNotifications) {
            description = (
                <FormattedMessage
                    id='user.settings.notifications.email.disabled'
                    defaultMessage='Email notifications are not enabled'
                />
            );
        } else if (enableEmail) {
            switch (newInterval) {
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
            case Preferences.INTERVAL_FIFTEEN_MINUTES:
                description = (
                    <FormattedMessage
                        id='user.settings.notifications.email.everyXMinutes'
                        defaultMessage='Every {count, plural, one {minute} other {{count, number} minutes}}'
                        values={{count: newInterval / SECONDS_PER_MINUTE}}
                    />
                );
                break;
            default:
                description = (
                    <FormattedMessage
                        id='user.settings.notifications.email.never'
                        defaultMessage='Never'
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
                focused={focused}
                section={'email'}
                updateSection={this.handleUpdateSection}
            />
        );
    }

    renderMaxSettingView = () => {
        if (!this.props.sendEmailNotifications) {
            return (
                <SettingItemMax
                    title={localizeMessage('user.settings.notifications.emailNotifications', 'Email notifications')}
                    inputs={[
                        <div
                            key='oauthEmailInfo'
                            className='padding-top'
                        >
                            <FormattedMessage
                                id='user.settings.notifications.email.disabled_long'
                                defaultMessage='Email notifications have not been enabled by your System Administrator.'
                            />
                        </div>,
                    ]}
                    server_error={this.props.serverError}
                    section={'email'}
                    updateSection={this.handleUpdateSection}
                />
            );
        }

        const {newInterval} = this.state;
        let batchingOptions = null;
        let batchingInfo = null;
        if (this.props.enableEmailBatching) {
            batchingOptions = (
                <fieldset>
                    <div className='radio'>
                        <label>
                            <input
                                id='emailNotificationMinutes'
                                type='radio'
                                name='emailNotifications'
                                checked={newInterval === Preferences.INTERVAL_FIFTEEN_MINUTES}
                                data-enable-email={'true'}
                                data-email-interval={Preferences.INTERVAL_FIFTEEN_MINUTES}
                                onChange={this.handleChange}
                            />
                            <FormattedMessage
                                id='user.settings.notifications.email.everyXMinutes'
                                defaultMessage='Every {count} minutes'
                                values={{count: Preferences.INTERVAL_FIFTEEN_MINUTES / SECONDS_PER_MINUTE}}
                            />
                        </label>
                    </div>
                    <div className='radio'>
                        <label>
                            <input
                                id='emailNotificationHour'
                                type='radio'
                                name='emailNotifications'
                                checked={newInterval === Preferences.INTERVAL_HOUR}
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
                </fieldset>
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
                    <fieldset key='userNotificationEmailOptions'>
                        <legend className='form-legend'>
                            <FormattedMessage
                                id='user.settings.notifications.email.send'
                                defaultMessage='Send email notifications'
                            />
                        </legend>
                        <div className='radio'>
                            <label>
                                <input
                                    id='emailNotificationImmediately'
                                    type='radio'
                                    name='emailNotifications'
                                    checked={newInterval === Preferences.INTERVAL_IMMEDIATE}
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
                                    checked={newInterval === Preferences.INTERVAL_NEVER}
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
                        <div className='margin-top x2'>
                            <FormattedMessage
                                id='user.settings.notifications.emailInfo'
                                defaultMessage='Email notifications are sent for mentions and direct messages when you are offline or away from {siteName} for more than 5 minutes.'
                                values={{
                                    siteName: this.props.siteName,
                                }}
                            />
                            {' '}
                            {batchingInfo}
                        </div>
                    </fieldset>,
                ]}
                submit={this.handleSubmit}
                saving={this.props.saving}
                server_error={this.props.serverError}
                updateSection={this.handleUpdateSection}
            />
        );
    }

    render() {
        if (this.props.activeSection !== 'email') {
            return this.renderMinSettingView();
        }

        return this.renderMaxSettingView();
    }
}
