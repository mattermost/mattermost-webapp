// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import AdminSettings from './admin_settings.jsx';
import BooleanSetting from './boolean_setting.jsx';
import SettingsGroup from './settings_group.jsx';

export default class LinkPreviewsSettings extends AdminSettings {
    constructor(props) {
        super(props);

        this.getConfigFromState = this.getConfigFromState.bind(this);

        this.renderSettings = this.renderSettings.bind(this);
    }

    getConfigFromState(config) {
        config.ServiceSettings.EnableLinkPreviews = this.state.enableLinkPreviews;

        return config;
    }

    getStateFromConfig(config) {
        return {
            enableLinkPreviews: config.ServiceSettings.EnableLinkPreviews,
        };
    }

    renderTitle() {
        return (
            <FormattedMessage
                id='admin.customization.linkPreviews'
                defaultMessage='Link Previews'
            />
        );
    }

    renderSettings() {
        return (
            <SettingsGroup>
                <BooleanSetting
                    id='enableLinkPreviews'
                    label={
                        <FormattedMessage
                            id='admin.customization.enableLinkPreviewsTitle'
                            defaultMessage='Enable Link Previews:'
                        />
                    }
                    helpText={
                        <FormattedMessage
                            id='admin.customization.enableLinkPreviewsDesc'
                            defaultMessage='Display a preview of website content below messages, when available. Users can disable these previews from Account Settings > Display > Website Link Previews.'
                        />
                    }
                    value={this.state.enableLinkPreviews}
                    onChange={this.handleChange}
                />
            </SettingsGroup>
        );
    }
}
