// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import AdminSettings from './admin_settings.jsx';
import BooleanSetting from './boolean_setting.jsx';
import SettingsGroup from './settings_group.jsx';

export default class CustomEmojiSettings extends AdminSettings {
    constructor(props) {
        super(props);

        this.getConfigFromState = this.getConfigFromState.bind(this);

        this.renderSettings = this.renderSettings.bind(this);
    }

    getConfigFromState(config) {
        config.ServiceSettings.EnableCustomEmoji = this.state.enableCustomEmoji;
        config.ServiceSettings.EnableEmojiPicker = this.state.enableEmojiPicker;

        return config;
    }

    getStateFromConfig(config) {
        return {
            enableCustomEmoji: config.ServiceSettings.EnableCustomEmoji,
            enableEmojiPicker: config.ServiceSettings.EnableEmojiPicker,
        };
    }

    renderTitle() {
        return (
            <FormattedMessage
                id='admin.customization.emoji'
                defaultMessage='Emoji'
            />
        );
    }

    renderSettings() {
        return (
            <SettingsGroup>
                <BooleanSetting
                    id='enableEmojiPicker'
                    label={
                        <FormattedMessage
                            id='admin.customization.enableEmojiPickerTitle'
                            defaultMessage='Enable Emoji Picker:'
                        />
                    }
                    helpText={
                        <FormattedMessage
                            id='admin.customization.enableEmojiPickerDesc'
                            defaultMessage='The emoji picker allows users to select emoji to add as reactions or use in messages. Enabling the emoji picker with a large number of custom emoji may slow down performance.'
                        />
                    }
                    value={this.state.enableEmojiPicker}
                    onChange={this.handleChange}
                    setByEnv={this.isSetByEnv('ServiceSettings.EnableEmojiPicker')}
                />
                <BooleanSetting
                    id='enableCustomEmoji'
                    label={
                        <FormattedMessage
                            id='admin.customization.enableCustomEmojiTitle'
                            defaultMessage='Enable Custom Emoji:'
                        />
                    }
                    helpText={
                        <FormattedMessage
                            id='admin.customization.enableCustomEmojiDesc'
                            defaultMessage='Enable users to create custom emoji for use in messages. When enabled, Custom Emoji settings can be accessed by switching to a team and clicking the three dots above the channel sidebar, and selecting "Custom Emoji".'
                        />
                    }
                    value={this.state.enableCustomEmoji}
                    onChange={this.handleChange}
                    setByEnv={this.isSetByEnv('ServiceSettings.EnableCustomEmoji')}
                />
            </SettingsGroup>
        );
    }
}
