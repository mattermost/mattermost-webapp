// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import AdminSettings from './admin_settings.jsx';
import BooleanSetting from './boolean_setting.jsx';
import TextSetting from './text_setting.jsx';
import SettingsGroup from './settings_group.jsx';

export default class CustomGifSettings extends AdminSettings {
    constructor(props) {
        super(props);

        this.getConfigFromState = this.getConfigFromState.bind(this);

        this.renderSettings = this.renderSettings.bind(this);
    }

    getConfigFromState(config) {
        config.ServiceSettings.EnableGifPicker = this.state.enableGifPicker;
        config.ServiceSettings.GfycatApiKey = this.state.gfycatApiKey;
        config.ServiceSettings.GfycatApiSecret = this.state.gfycatApiSecret;
        return config;
    }

    getStateFromConfig(config) {
        return {
            enableGifPicker: config.ServiceSettings.EnableGifPicker,
            gfycatApiKey: config.ServiceSettings.GfycatApiKey,
            gfycatApiSecret: config.ServiceSettings.GfycatApiSecret,
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
                <TextSetting
                    id='gfycatApiKey'
                    label={
                        <FormattedMessage
                            id='admin.customization.gfycatApiKey'
                            defaultMessage='Gfycat API Key:'
                        />
                    }
                    value={this.state.gfycatApiKey}
                    placeholder=''
                    onChange={this.handleChange}
                    setByEnv={this.isSetByEnv('ServiceSettings.GfycatAPIKey')}
                />
                <TextSetting
                    id='gfycatApiSecret'
                    label={
                        <FormattedMessage
                            id='admin.customization.gfycatApiSecret'
                            defaultMessage='Gfycat API Secret:'
                        />
                    }
                    helpText={
                        <FormattedMessage
                            id='admin.customization.gfycatApiSecretDescription'
                            defaultMessage='Obtain from Gfycat a client_id and client_secret at https://developers.gfycat.com/signup/#/keys. After requesting an API key this information will be emailed to you. Input that information here to enable GIFs for your team.'
                        />
                    }
                    value={this.state.gfycatApiSecret}
                    placeholder=''
                    onChange={this.handleChange}
                    setByEnv={this.isSetByEnv('ServiceSettings.GfycatAPISecret')}
                />
            </SettingsGroup>
        );
    }
}
