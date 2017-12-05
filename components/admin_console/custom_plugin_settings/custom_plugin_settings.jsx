// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';

import {PluginSettings} from 'utils/constants.jsx';
import {formatText} from 'utils/text_formatting.jsx';

import * as Utils from 'utils/utils.jsx';

import LoadingScreen from 'components/loading_screen.jsx';
import AdminSettings from 'components/admin_console/admin_settings.jsx';
import BooleanSetting from 'components/admin_console/boolean_setting.jsx';
import TextSetting from 'components/admin_console/text_setting.jsx';
import DropdownSetting from 'components/admin_console/dropdown_setting.jsx';
import RadioSetting from 'components/admin_console/radio_setting.jsx';
import GeneratedSetting from 'components/admin_console/generated_setting.jsx';
import UserAutocompleteSetting from 'components/admin_console/user_autocomplete_setting.jsx';
import SettingsGroup from 'components/admin_console/settings_group.jsx';

export default class CustomPluginSettings extends AdminSettings {
    constructor(props) {
        super(props);

        this.getConfigFromState = this.getConfigFromState.bind(this);
        this.renderSettings = this.renderSettings.bind(this);
        this.renderTitle = this.renderTitle.bind(this);
        this.buildPluginTextSetting = this.buildPluginTextSetting.bind(this);
        this.buildPluginBoolSetting = this.buildPluginBoolSetting.bind(this);
        this.buildPluginDropdownSetting = this.buildPluginDropdownSetting.bind(this);
        this.buildPluginRadioSetting = this.buildPluginRadioSetting.bind(this);
        this.buildPluginGeneratedSetting = this.buildPluginGeneratedSetting.bind(this);
        this.buildPluginUsernameSetting = this.buildPluginUsernameSetting.bind(this);
        this.handleGeneratedChange = this.handleGeneratedChange.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.plugin !== this.props.plugin) {
            this.setState(this.getStateFromConfig(nextProps.config, nextProps.plugin));
        }
    }

    getConfigFromState(config) {
        const plugin = this.props.plugin;

        if (plugin && plugin.settings_schema) {
            if (!config.PluginSettings.Plugins[plugin.id]) {
                config.PluginSettings.Plugins[plugin.id] = {};
            }

            const configSettings = config.PluginSettings.Plugins[plugin.id];

            const settings = plugin.settings_schema.settings || [];
            settings.forEach((setting) => {
                const lowerKey = setting.key.toLowerCase();
                configSettings[lowerKey] = this.state[lowerKey];
            });
        }

        return config;
    }

    getStateFromConfig(config, plugin = this.props.plugin) {
        const state = {};

        if (plugin && plugin.settings_schema) {
            const configSettings = config.PluginSettings.Plugins[plugin.id] || {};

            const settings = plugin.settings_schema.settings || [];
            settings.forEach((setting) => {
                const lowerKey = setting.key.toLowerCase();
                state[lowerKey] = configSettings[lowerKey] == null ? setting.default : configSettings[lowerKey];
            });
        }

        return state;
    }

    renderTitle() {
        return this.props.plugin ? (this.props.plugin.name || this.props.plugin.id) : '';
    }

    buildPluginSetting = (id, setting) => {
        switch (setting.type) {
        case PluginSettings.TYPE_TEXT:
            return this.buildPluginTextSetting(id, setting);
        case PluginSettings.TYPE_BOOL:
            return this.buildPluginBoolSetting(id, setting);
        case PluginSettings.TYPE_DROPDOWN:
            return this.buildPluginDropdownSetting(id, setting);
        case PluginSettings.TYPE_RADIO:
            return this.buildPluginRadioSetting(id, setting);
        case PluginSettings.TYPE_GENERATED:
            return this.buildPluginGeneratedSetting(id, setting);
        case PluginSettings.TYPE_USERNAME:
            return this.buildPluginUsernameSetting(id, setting);
        }

        return null;
    }

    buildPluginTextSetting(id, setting) {
        return (
            <TextSetting
                key={this.props.plugin.id + '_plugin_text_' + id}
                id={id}
                label={setting.display_name + ':'}
                helpText={setting.help_text}
                placeholder={setting.placeholder}
                value={this.state[id] || ''}
                onChange={this.handleChange}
            />
        );
    }

    buildPluginBoolSetting(id, setting) {
        return (
            <BooleanSetting
                key={this.props.plugin.id + '_plugin_bool_' + id}
                id={id}
                label={setting.display_name + ':'}
                helpText={setting.help_text}
                value={this.state[id] || false}
                onChange={this.handleChange}
            />
        );
    }

    buildPluginDropdownSetting(id, setting) {
        const options = setting.options || [];
        const values = options.map((o) => ({value: o.value, text: o.display_name}));

        return (
            <DropdownSetting
                key={this.props.plugin.id + '_plugin_dropdown_' + id}
                id={id}
                values={values}
                label={setting.display_name + ':'}
                helpText={setting.help_text}
                value={this.state[id] || values[0]}
                onChange={this.handleChange}
            />
        );
    }

    buildPluginRadioSetting(id, setting) {
        const options = setting.options || [];
        const values = options.map((o) => ({value: o.value, text: o.display_name}));

        return (
            <RadioSetting
                key={this.props.plugin.id + '_plugin_radio_' + id}
                id={id}
                values={values}
                label={setting.display_name + ':'}
                helpText={setting.help_text}
                value={this.state[id] || values[0]}
                onChange={this.handleChange}
            />
        );
    }

    buildPluginGeneratedSetting(id, setting) {
        return (
            <GeneratedSetting
                key={this.props.plugin.id + '_plugin_generated_' + id}
                id={id}
                label={setting.display_name + ':'}
                helpText={setting.help_text}
                regenerateHelpText={setting.regenerate_help_text}
                placeholder={setting.placeholder}
                value={this.state[id] || ''}
                onChange={this.handleGeneratedChange}
            />
        );
    }

    handleGeneratedChange(id, s) {
        this.handleChange(id, s.replace('+', '-').replace('/', '_'));
    }

    buildPluginUsernameSetting(id, setting) {
        return (
            <UserAutocompleteSetting
                key={this.props.plugin.id + '_plugin_userautocomplete_' + id}
                id={id}
                label={setting.display_name + ':'}
                helpText={setting.help_text}
                placeholder={setting.placeholder || Utils.localizeMessage('search_bar.search', 'Search')}
                value={this.state[id] || ''}
                onChange={this.handleChange}
            />
        );
    }

    renderSettings() {
        const plugin = this.props.plugin;

        if (!plugin) {
            return <LoadingScreen/>;
        }

        const schema = plugin.settings_schema || {};
        const settingsList = [];
        if (schema.settings) {
            schema.settings.forEach((setting) => {
                settingsList.push(this.buildPluginSetting(setting.key.toLowerCase(), setting));
            });
        }

        let header;
        if (schema.header) {
            header = (
                <div
                    className='banner'
                    dangerouslySetInnerHTML={{__html: formatText(schema.header, {mentionHighlight: false})}}
                />
            );
        }

        let footer;
        if (schema.footer) {
            footer = (
                <div
                    className='banner'
                    dangerouslySetInnerHTML={{__html: formatText(schema.footer, {mentionHighlight: false})}}
                />
            );
        }

        return (
            <SettingsGroup>
                {header}
                {settingsList}
                {footer}
            </SettingsGroup>
        );
    }
}
