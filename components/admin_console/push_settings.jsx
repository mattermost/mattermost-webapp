// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
/* eslint-disable react/no-string-refs */

import React from 'react';
import {FormattedMessage} from 'react-intl';

import Constants from 'utils/constants';
import * as Utils from 'utils/utils.jsx';

import FormattedMarkdownMessage from 'components/formatted_markdown_message.jsx';

import AdminSettings from './admin_settings';
import DropdownSetting from './dropdown_setting.jsx';
import SettingsGroup from './settings_group.jsx';
import TextSetting from './text_setting';

const PUSH_NOTIFICATIONS_OFF = 'off';
const PUSH_NOTIFICATIONS_MHPNS = 'mhpns';
const PUSH_NOTIFICATIONS_MTPNS = 'mtpns';
const PUSH_NOTIFICATIONS_CUSTOM = 'custom';

export default class PushSettings extends AdminSettings {
    canSave = () => {
        return this.state.pushNotificationServerType !== PUSH_NOTIFICATIONS_MHPNS || this.state.agree;
    }

    handleAgreeChange = (e) => {
        this.setState({
            agree: e.target.checked,
        });
    }

    handleDropdownChange = (id, value) => {
        if (id === 'pushNotificationServerType') {
            this.setState({
                agree: false,
            });

            if (value === PUSH_NOTIFICATIONS_MHPNS) {
                this.setState({
                    pushNotificationServer: Constants.MHPNS,
                });
            } else if (value === PUSH_NOTIFICATIONS_MTPNS) {
                this.setState({
                    pushNotificationServer: Constants.MTPNS,
                });
            } else if (value === PUSH_NOTIFICATIONS_CUSTOM &&
                (this.state.pushNotificationServerType === PUSH_NOTIFICATIONS_MTPNS ||
                this.state.pushNotificationServerType === PUSH_NOTIFICATIONS_MHPNS)) {
                this.setState({
                    pushNotificationServer: '',
                });
            }
        }

        this.handleChange(id, value);
    }

    getConfigFromState = (config) => {
        config.EmailSettings.SendPushNotifications = this.state.pushNotificationServerType !== PUSH_NOTIFICATIONS_OFF;
        config.EmailSettings.PushNotificationServer = this.state.pushNotificationServer.trim();
        config.TeamSettings.MaxNotificationsPerChannel = this.state.maxNotificationsPerChannel;

        return config;
    }

    getStateFromConfig(config) {
        let pushNotificationServerType = PUSH_NOTIFICATIONS_CUSTOM;
        let agree = false;
        if (!config.EmailSettings.SendPushNotifications) {
            pushNotificationServerType = PUSH_NOTIFICATIONS_OFF;
        } else if (config.EmailSettings.PushNotificationServer === Constants.MHPNS &&
            this.props.license.IsLicensed === 'true' && this.props.license.MHPNS === 'true') {
            pushNotificationServerType = PUSH_NOTIFICATIONS_MHPNS;
            agree = true;
        } else if (config.EmailSettings.PushNotificationServer === Constants.MTPNS) {
            pushNotificationServerType = PUSH_NOTIFICATIONS_MTPNS;
        }

        let pushNotificationServer = config.EmailSettings.PushNotificationServer;
        if (pushNotificationServerType === PUSH_NOTIFICATIONS_MTPNS) {
            pushNotificationServer = Constants.MTPNS;
        } else if (pushNotificationServerType === PUSH_NOTIFICATIONS_MHPNS) {
            pushNotificationServer = Constants.MHPNS;
        }

        const maxNotificationsPerChannel = config.TeamSettings.MaxNotificationsPerChannel;

        return {
            pushNotificationServerType,
            pushNotificationServer,
            maxNotificationsPerChannel,
            agree,
        };
    }

    isPushNotificationServerSetByEnv = () => {
        // Assume that if one of these has been set using an environment variable,
        // all of them have been set that way
        return this.isSetByEnv('EmailSettings.SendPushNotifications') ||
            this.isSetByEnv('EmailSettings.PushNotificationServer');
    };

    renderTitle() {
        return (
            <FormattedMessage
                id='admin.environment.pushNotificationServer'
                defaultMessage='Push Notification Server'
            />
        );
    }

    renderSettings = () => {
        const pushNotificationServerTypes = [];
        pushNotificationServerTypes.push({value: PUSH_NOTIFICATIONS_OFF, text: Utils.localizeMessage('admin.email.pushOff', 'Do not send push notifications')});
        if (this.props.license.IsLicensed === 'true' && this.props.license.MHPNS === 'true') {
            pushNotificationServerTypes.push({value: PUSH_NOTIFICATIONS_MHPNS, text: Utils.localizeMessage('admin.email.mhpns', 'Use HPNS connection with uptime SLA to send notifications to iOS and Android apps')});
        }
        pushNotificationServerTypes.push({value: PUSH_NOTIFICATIONS_MTPNS, text: Utils.localizeMessage('admin.email.mtpns', 'Use TPNS connection to send notifications to iOS and Android apps')});
        pushNotificationServerTypes.push({value: PUSH_NOTIFICATIONS_CUSTOM, text: Utils.localizeMessage('admin.email.selfPush', 'Manually enter Push Notification Service location')});

        let sendHelpText = null;
        let pushServerHelpText = null;
        if (this.state.pushNotificationServerType === PUSH_NOTIFICATIONS_OFF) {
            sendHelpText = (
                <FormattedMarkdownMessage
                    id='admin.email.pushOffHelp'
                    defaultMessage='Please see [documentation on push notifications](!https://about.mattermost.com/default-mobile-push-notifications/) to learn more about setup options.'
                />
            );
        } else if (this.state.pushNotificationServerType === PUSH_NOTIFICATIONS_MHPNS) {
            pushServerHelpText = (
                <FormattedMarkdownMessage
                    id='admin.email.mhpnsHelp'
                    defaultMessage='Download [Mattermost iOS app](!https://about.mattermost.com/mattermost-ios-app/) from iTunes. Download [Mattermost Android app](!https://about.mattermost.com/mattermost-android-app/) from Google Play. Learn more about the [Mattermost Hosted Push Notification Service](!https://about.mattermost.com/default-hpns/).'
                />
            );
        } else if (this.state.pushNotificationServerType === PUSH_NOTIFICATIONS_MTPNS) {
            pushServerHelpText = (
                <FormattedMarkdownMessage
                    id='admin.email.mtpnsHelp'
                    defaultMessage='Download [Mattermost iOS app](!https://about.mattermost.com/mattermost-ios-app/) from iTunes. Download [Mattermost Android app](!https://about.mattermost.com/mattermost-android-app/) from Google Play. Learn more about the [Mattermost Test Push Notification Service](!https://about.mattermost.com/default-tpns/).'
                />
            );
        } else {
            pushServerHelpText = (
                <FormattedMarkdownMessage
                    id='admin.email.easHelp'
                    defaultMessage='Learn more about compiling and deploying your own mobile apps from an [Enterprise App Store](!https://about.mattermost.com/default-enterprise-app-store).'
                />
            );
        }

        let tosCheckbox;
        if (this.state.pushNotificationServerType === PUSH_NOTIFICATIONS_MHPNS) {
            tosCheckbox = (
                <div className='form-group'>
                    <div className='col-sm-4'/>
                    <div className='col-sm-8'>
                        <input
                            type='checkbox'
                            ref='agree'
                            checked={this.state.agree}
                            onChange={this.handleAgreeChange}
                            disabled={this.props.isDisabled}
                        />
                        <FormattedMarkdownMessage
                            id='admin.email.agreeHPNS'
                            defaultMessage=' I understand and accept the Mattermost Hosted Push Notification Service [Terms of Service](!https://about.mattermost.com/hpns-terms/) and [Privacy Policy](!https://about.mattermost.com/hpns-privacy/).'
                        />
                    </div>
                </div>
            );
        }

        return (
            <SettingsGroup>
                <DropdownSetting
                    id='pushNotificationServerType'
                    values={pushNotificationServerTypes}
                    label={
                        <FormattedMessage
                            id='admin.email.pushTitle'
                            defaultMessage='Enable Push Notifications: '
                        />
                    }
                    value={this.state.pushNotificationServerType}
                    onChange={this.handleDropdownChange}
                    helpText={sendHelpText}
                    setByEnv={this.isPushNotificationServerSetByEnv()}
                    disabled={this.props.isDisabled}
                />
                {tosCheckbox}
                <TextSetting
                    id='pushNotificationServer'
                    label={
                        <FormattedMessage
                            id='admin.email.pushServerTitle'
                            defaultMessage='Push Notification Server:'
                        />
                    }
                    placeholder={Utils.localizeMessage('admin.email.pushServerEx', 'E.g.: "https://push-test.mattermost.com"')}
                    helpText={pushServerHelpText}
                    value={this.state.pushNotificationServer}
                    onChange={this.handleChange}
                    disabled={this.props.isDisabled || this.state.pushNotificationServerType !== PUSH_NOTIFICATIONS_CUSTOM}
                    setByEnv={this.isSetByEnv('EmailSettings.PushNotificationServer')}
                />
                <TextSetting
                    id='maxNotificationsPerChannel'
                    type='number'
                    label={
                        <FormattedMessage
                            id='admin.team.maxNotificationsPerChannelTitle'
                            defaultMessage='Max Notifications Per Channel:'
                        />
                    }
                    placeholder={Utils.localizeMessage('admin.team.maxNotificationsPerChannelExample', 'E.g.: "1000"')}
                    helpText={
                        <FormattedMarkdownMessage
                            id='admin.team.maxNotificationsPerChannelDescription'
                            defaultMessage='Maximum total number of users in a channel before users typing messages, @all, @here, and @channel no longer send notifications because of performance.'
                        />
                    }
                    value={this.state.maxNotificationsPerChannel}
                    onChange={this.handleChange}
                    setByEnv={this.isSetByEnv('TeamSettings.MaxNotificationsPerChannel')}
                    disabled={this.props.isDisabled}
                />
            </SettingsGroup>
        );
    }
}
/* eslint-enable react/no-string-refs */
