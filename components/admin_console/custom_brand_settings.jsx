// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import Constants from 'utils/constants.jsx';
import * as Utils from 'utils/utils.jsx';

import AdminSettings from './admin_settings.jsx';
import BooleanSetting from './boolean_setting.jsx';
import BrandImageSetting from './brand_image_setting/brand_image_setting.jsx';
import SettingsGroup from './settings_group.jsx';
import TextSetting from './text_setting.jsx';

export default class CustomBrandSettings extends AdminSettings {
    getConfigFromState(config) {
        config.TeamSettings.SiteName = this.state.siteName;
        config.TeamSettings.CustomDescriptionText = this.state.customDescriptionText;
        config.TeamSettings.EnableCustomBrand = this.state.enableCustomBrand;
        config.TeamSettings.CustomBrandText = this.state.customBrandText;

        return config;
    }

    getStateFromConfig(config) {
        return {
            siteName: config.TeamSettings.SiteName,
            enableCustomBrand: config.TeamSettings.EnableCustomBrand,
            customBrandText: config.TeamSettings.CustomBrandText,
            customDescriptionText: config.TeamSettings.CustomDescriptionText,
        };
    }

    renderTitle() {
        return (
            <FormattedMessage
                id='admin.customization.customBrand'
                defaultMessage='Custom Branding'
            />
        );
    }

    renderSettings() {
        return (
            <SettingsGroup>
                <TextSetting
                    id='siteName'
                    label={
                        <FormattedMessage
                            id='admin.team.siteNameTitle'
                            defaultMessage='Site Name:'
                        />
                    }
                    maxLength={Constants.MAX_SITENAME_LENGTH}
                    placeholder={Utils.localizeMessage('admin.team.siteNameExample', 'E.g.: "Mattermost"')}
                    helpText={
                        <FormattedMessage
                            id='admin.team.siteNameDescription'
                            defaultMessage='Name of service shown in login screens and UI.'
                        />
                    }
                    value={this.state.siteName}
                    onChange={this.handleChange}
                    setByEnv={this.isSetByEnv('TeamSettings.SiteName')}
                />
                <TextSetting
                    key='customDescriptionText'
                    id='customDescriptionText'
                    label={
                        <FormattedMessage
                            id='admin.team.brandDescriptionTitle'
                            defaultMessage='Site Description: '
                        />
                    }
                    helpText={
                        <FormattedMessage
                            id='admin.team.brandDescriptionHelp'
                            defaultMessage='Description of service shown in login screens and UI. When not specified, "All team communication in one place, searchable and accessible anywhere" is displayed.'
                        />
                    }
                    value={this.state.customDescriptionText}
                    placeholder={Utils.localizeMessage('web.root.signup_info', 'All team communication in one place, searchable and accessible anywhere')}
                    onChange={this.handleChange}
                    setByEnv={this.isSetByEnv('TeamSettings.CustomDescriptionText')}
                />
                <BooleanSetting
                    key='enableCustomBrand'
                    id='enableCustomBrand'
                    label={
                        <FormattedMessage
                            id='admin.team.brandTitle'
                            defaultMessage='Enable Custom Branding: '
                        />
                    }
                    helpText={
                        <FormattedMessage
                            id='admin.team.brandDesc'
                            defaultMessage='Enable custom branding to show an image of your choice, uploaded below, and some help text, written below, on the login page.'
                        />
                    }
                    value={this.state.enableCustomBrand}
                    onChange={this.handleChange}
                    setByEnv={this.isSetByEnv('TeamSettings.EnableCustomBrand')}
                />
                <BrandImageSetting
                    key='customBrandImage'
                    disabled={!this.state.enableCustomBrand}
                />
                <TextSetting
                    key='customBrandText'
                    id='customBrandText'
                    type='textarea'
                    label={
                        <FormattedMessage
                            id='admin.team.brandTextTitle'
                            defaultMessage='Custom Brand Text:'
                        />
                    }
                    helpText={
                        <FormattedMessage
                            id='admin.team.brandTextDescription'
                            defaultMessage='Text that will appear below your custom brand image on your login screen. Supports Markdown-formatted text. Maximum 500 characters allowed.'
                        />
                    }
                    value={this.state.customBrandText}
                    onChange={this.handleChange}
                    disabled={!this.state.enableCustomBrand}
                    setByEnv={this.isSetByEnv('TeamSettings.CustomBrandText')}
                />
            </SettingsGroup>
        );
    }
}
