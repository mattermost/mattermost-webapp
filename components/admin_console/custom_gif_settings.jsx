// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import AdminSettings from './admin_settings.jsx';
import BooleanSetting from './boolean_setting.jsx';
import SettingsGroup from './settings_group.jsx';

export default class CustomGifSettings extends AdminSettings {
    constructor(props) {
        super(props);

        this.getConfigFromState = this.getConfigFromState.bind(this);

        this.renderSettings = this.renderSettings.bind(this);
    }

    getConfigFromState(config) {
        config.ServiceSettings.EnableGifPicker = this.state.enableGifPicker;
        return config;
    }

    getStateFromConfig(config) {
        return {
            enableGifPicker: config.ServiceSettings.EnableGifPicker,
        };
    }

    renderTitle() {
        return (
            <FormattedMessage
                id='admin.customization.gif'
                defaultMessage='GIF (Beta)'
            />
        );
    }

    renderSettings() {
        return (
            <SettingsGroup>
                <BooleanSetting
                    id='enableGifPicker'
                    label={
                        <FormattedMessage
                            id='admin.customization.enableGifPickerTitle'
                            defaultMessage='Enable GIF Picker:'
                        />
                    }
                    helpText={
                        <FormattedMessage
                            id='admin.customization.enableGifPickerDesc'
                            defaultMessage='The gif picker allows users to select gifs to use in messages.'
                        />
                    }
                    value={this.state.enableGifPicker}
                    onChange={this.handleChange}
                    setByEnv={this.isSetByEnv('ServiceSettings.EnableGifPicker')}
                />
            </SettingsGroup>
        );
    }
}
