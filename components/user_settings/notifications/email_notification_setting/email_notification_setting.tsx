// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import {getEmailInterval} from 'mattermost-redux/utils/notify_props';
import {PreferenceType} from 'mattermost-redux/types/preferences';

import {Preferences} from 'utils/constants';
import {localizeMessage} from 'utils/utils.jsx';
import SettingItemMax from 'components/setting_item_max.jsx';
import SettingItemMin from 'components/setting_item_min';

const SECONDS_PER_MINUTE = 60;

type Props = {
    currentUserId: string;
    activeSection: string;
    updateSection: (section: string) => void;
    enableEmail: string;
    emailInterval: number;
    onSubmit: () => void;
    onCancel: () => void;
    onChange: (enableEmail: string) => void;
    serverError?: string;
    saving?: boolean;
    sendEmailNotifications: boolean;
    enableEmailBatching: boolean;
    actions: {
        savePreferences: (currentUserId: string, emailIntervalPreference: PreferenceType[]) =>
        Promise<{data: boolean}>;
    };
};

type State = {
    activeSection: string;
    emailInterval: number;
    enableEmail: string;
    enableEmailBatching: boolean;
    sendEmailNotifications: boolean;
    newInterval: number;
};

export default class EmailNotificationSetting extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);

        const {
            emailInterval,
            enableEmail,
            enableEmailBatching,
            sendEmailNotifications,
            activeSection,
        } = props;

        this.state = {
            activeSection,
            emailInterval,
            enableEmail,
            enableEmailBatching,
            sendEmailNotifications,
            newInterval: getEmailInterval(JSON.parse(enableEmail) && sendEmailNotifications, enableEmailBatching, emailInterval),
        };
    }

    static getDerivedStateFromProps(nextProps: Props, prevState: State) {
        const {
            emailInterval,
            enableEmail,
            enableEmailBatching,
            sendEmailNotifications,
            activeSection,
        } = nextProps;

        // If we're re-opening this section, reset to defaults from props
        if (activeSection === 'email' && prevState.activeSection !== 'email') {
            return {
                activeSection,
                emailInterval,
                enableEmail,
                enableEmailBatching,
                sendEmailNotifications,
                newInterval: getEmailInterval(JSON.parse(enableEmail) && sendEmailNotifications, enableEmailBatching, emailInterval),
            };
        }

        if (sendEmailNotifications !== prevState.sendEmailNotifications ||
            enableEmailBatching !== prevState.enableEmailBatching ||
            emailInterval !== prevState.emailInterval ||
            activeSection !== prevState.activeSection
        ) {
            return {
                activeSection,
                emailInterval,
                enableEmail,
                enableEmailBatching,
                sendEmailNotifications,
                newInterval: getEmailInterval(JSON.parse(enableEmail) && sendEmailNotifications, enableEmailBatching, emailInterval),
            };
        }

        return null;
    }

    handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const enableEmail = e.currentTarget.getAttribute('data-enable-email')!;
        const newInterval = parseInt(e.currentTarget.getAttribute('data-email-interval')!, 10);

        this.setState({
            enableEmail,
            newInterval,
        });

        this.props.onChange(enableEmail);
    }

    handleSubmit = async () => {
        const {newInterval} = this.state;
        if (this.props.emailInterval === newInterval && this.props.enableEmail === this.state.enableEmail) {
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

    handleUpdateSection = (section?: string) => {
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
                title={localizeMessage('user.settings.notifications.emailNotifications', 'Email Notifications')}
                describe={description}
                section={'email'}
                updateSection={this.handleUpdateSection}
            />
        );
    }

    renderMaxSettingView = () => {
        if (!this.props.sendEmailNotifications) {
            return (
                <SettingItemMax
                    title={localizeMessage('user.settings.notifications.emailNotifications', 'Email Notifications')}
                    inputs={[
                        <div
                            key='oauthEmailInfo'
                            className='pt-2'
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
                title={localizeMessage('user.settings.notifications.emailNotifications', 'Email Notifications')}
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
                        <div className='mt-3'>
                            <FormattedMessage
                                id='user.settings.notifications.emailInfo'
                                defaultMessage='Email notifications are sent for mentions and direct messages when you are offline or away for more than 5 minutes.'
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
