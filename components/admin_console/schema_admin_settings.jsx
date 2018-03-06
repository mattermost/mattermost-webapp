// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';
import {FormattedHTMLMessage, FormattedMessage} from 'react-intl';

import * as I18n from 'i18n/i18n.jsx';

import {SettingsTypes} from 'utils/constants.jsx';
import {formatText} from 'utils/text_formatting.jsx';
import * as Utils from 'utils/utils.jsx';
import RequestButton from 'components/admin_console/request_button/request_button';
import LoadingScreen from 'components/loading_screen.jsx';
import AdminSettings from 'components/admin_console/admin_settings.jsx';
import BooleanSetting from 'components/admin_console/boolean_setting.jsx';
import TextSetting from 'components/admin_console/text_setting.jsx';
import DropdownSetting from 'components/admin_console/dropdown_setting.jsx';
import MultiSelectSetting from 'components/admin_console/multiselect_settings.jsx';
import RadioSetting from 'components/admin_console/radio_setting.jsx';
import GeneratedSetting from 'components/admin_console/generated_setting.jsx';
import UserAutocompleteSetting from 'components/admin_console/user_autocomplete_setting.jsx';
import SettingsGroup from 'components/admin_console/settings_group.jsx';

export default class SchemaAdminSettings extends AdminSettings {
    componentWillReceiveProps(nextProps) {
        if (nextProps.schema !== this.props.schema) {
            this.setState(this.getStateFromConfig(nextProps.config, nextProps.schema));
        }
    }

    getConfigFromState(config) {
        const schema = this.props.schema;

        if (schema) {
            if (!config[schema.id]) {
                config[schema.id] = {};
            }

            const configSettings = config[schema.id];

            const settings = schema.settings || [];
            settings.forEach((setting) => {
                configSettings[setting.key] = this.state[setting.key];
            });
        }

        return config;
    }

    getStateFromConfig(config, schema = this.props.schema) {
        const state = {};

        if (schema) {
            const configSettings = config[schema.id] || {};

            const settings = schema.settings || [];
            settings.forEach((setting) => {
                state[setting.key] = configSettings[setting.key] == null ? setting.default : configSettings[setting.key];
            });
        }

        return state;
    }

    renderTitle = () => {
        if (!this.props.schema) {
            return '';
        }
        if (this.props.schema.translate === false) {
            return this.props.schema.name || this.props.schema.id;
        }
        return <FormattedMessage id={this.props.schema.name || this.props.schema.id}/>;
    }

    renderBanner = (setting) => {
        if (!this.props.schema) {
            return <span>{''}</span>;
        }

        if (this.props.schema.translate === false) {
            return <span>{setting.label}</span>;
        }

        if (typeof setting.label === 'string') {
            if (setting.label_html) {
                return (
                    <FormattedHTMLMessage
                        id={setting.label}
                        values={setting.label_values}
                        defaultMessage={setting.label_default}
                    />
                );
            }
            return (
                <FormattedMessage
                    id={setting.label}
                    defaultMessage={setting.label_default}
                    values={setting.label_values}
                />
            );
        }
        return setting.label;
    }

    renderHelpText = (setting) => {
        if (!this.props.schema) {
            return <span>{''}</span>;
        }

        if (this.props.schema.translate === false) {
            return <span>{setting.help_text}</span>;
        }

        if (typeof setting.help_text === 'string') {
            if (setting.help_text_html) {
                return (
                    <FormattedHTMLMessage
                        id={setting.help_text}
                        values={setting.help_text_values}
                        defaultMessage={setting.help_text_default}
                    />
                );
            }
            return (
                <FormattedMessage
                    id={setting.help_text}
                    defaultMessage={setting.help_text_default}
                    values={setting.help_text_values}
                />
            );
        }
        return setting.help_text;
    }

    renderLabel = (setting) => {
        if (!this.props.schema) {
            return '';
        }

        if (this.props.schema.translate === false) {
            return setting.label;
        }
        return Utils.localizeMessage(setting.label, setting.label_default);
    }

    isDisabled = (setting) => {
        if (setting.needs) {
            for (const need of setting.needs) {
                if (this.state[need[0]] !== need[1]) {
                    return true;
                }
            }
        }
        if (setting.needs_license && !this.props.license.IsLicensed) {
            return true;
        }
        if (setting.needs_no_license && this.props.license.IsLicensed) {
            return true;
        }
        return false;
    }

    buildSetting = (id, setting) => {
        switch (setting.type) {
        case SettingsTypes.TYPE_TEXT:
            return this.buildTextSetting(id, setting);
        case SettingsTypes.TYPE_NUMBER:
            return this.buildTextSetting(id, setting);
        case SettingsTypes.TYPE_BOOL:
            return this.buildBoolSetting(id, setting);
        case SettingsTypes.TYPE_DROPDOWN:
            return this.buildDropdownSetting(id, setting);
        case SettingsTypes.TYPE_RADIO:
            return this.buildRadioSetting(id, setting);
        case SettingsTypes.TYPE_BANNER:
            return this.buildBannerSetting(id, setting);
        case SettingsTypes.TYPE_GENERATED:
            return this.buildGeneratedSetting(id, setting);
        case SettingsTypes.TYPE_USERNAME:
            return this.buildUsernameSetting(id, setting);
        case SettingsTypes.TYPE_BUTTON:
            return this.buildButtonSetting(id, setting);
        case SettingsTypes.TYPE_LANGUAGE:
            return this.buildLanguageSetting(id, setting);
        }

        return null;
    }

    buildButtonSetting = (id, setting) => {
        return (
            <RequestButton
                key={this.props.schema.id + '_text_' + id}
                requestAction={setting.action}
                helpText={this.renderHelpText(setting)}
                buttonText={<span>{this.renderLabel(setting)}</span>}
                showSuccessMessage={false}
                includeDetailedError={true}
                errorMessage={{
                    id: setting.error_message,
                    defaultMessage: setting.error_message,
                }}
            />
        );
    }

    buildTextSetting = (id, setting) => {
        let inputType = 'input';
        if (setting.type === SettingsTypes.TYPE_NUMBER) {
            inputType = 'number';
        }
        return (
            <TextSetting
                key={this.props.schema.id + '_text_' + id}
                id={id}
                type={inputType}
                label={this.renderLabel(setting)}
                helpText={this.renderHelpText(setting)}
                placeholder={Utils.localizeMessage(setting.placeholder, setting.placeholder_default)}
                value={this.state[id] || ''}
                disabled={this.isDisabled(setting)}
                onChange={this.handleChange}
            />
        );
    }

    buildBoolSetting = (id, setting) => {
        return (
            <BooleanSetting
                key={this.props.schema.id + '_bool_' + id}
                id={id}
                label={this.renderLabel(setting)}
                helpText={this.renderHelpText(setting)}
                value={this.state[id] || false}
                disabled={this.isDisabled(setting)}
                onChange={this.handleChange}
            />
        );
    }

    buildDropdownSetting = (id, setting) => {
        const options = setting.options || [];
        const values = options.map((o) => ({value: o.value, text: Utils.localizeMessage(o.display_name)}));

        return (
            <DropdownSetting
                key={this.props.schema.id + '_dropdown_' + id}
                id={id}
                values={values}
                label={this.renderLabel(setting)}
                helpText={this.renderHelpText(setting)}
                value={this.state[id] || values[0].value}
                disabled={this.isDisabled(setting)}
                onChange={this.handleChange}
            />
        );
    }

    buildLanguageSetting = (id, setting) => {
        const locales = I18n.getAllLanguages();
        const values = Object.keys(locales).map((l) => {
            return {value: locales[l].value, text: locales[l].name, order: locales[l].order};
        }).sort((a, b) => a.order - b.order);

        if (setting.multiple) {
            const noResultText = (
                <FormattedMessage
                    id={setting.no_result}
                    defaultMessage={setting.no_result_default}
                />
            );
            const notPresent = (
                <FormattedMessage
                    id={setting.not_present}
                    defaultMessage={setting.not_present_default}
                />
            );
            return (
                <MultiSelectSetting
                    key={this.props.schema.id + '_language_' + id}
                    id={id}
                    label={this.renderLabel(setting)}
                    values={values}
                    helpText={this.renderHelpText(setting)}
                    selected={(this.state[id] && this.state[id].split(',')) || []}
                    disabled={this.isDisabled(setting)}
                    onChange={(changedId, value) => this.handleChange(changedId, value.join(','))}
                    noResultText={noResultText}
                    notPresent={notPresent}
                />
            );
        }
        return (
            <DropdownSetting
                key={this.props.schema.id + '_language_' + id}
                id={id}
                label={this.renderLabel(setting)}
                values={values}
                helpText={this.renderHelpText(setting)}
                value={this.state[id] || values[0].value}
                disabled={this.isDisabled(setting)}
                onChange={this.handleChange}
            />
        );
    }

    buildRadioSetting = (id, setting) => {
        const options = setting.options || [];
        const values = options.map((o) => ({value: o.value, text: o.display_name}));

        return (
            <RadioSetting
                key={this.props.schema.id + '_radio_' + id}
                id={id}
                values={values}
                label={this.renderLabel(setting)}
                helpText={this.renderHelpText(setting)}
                value={this.state[id] || values[0]}
                disabled={this.isDisabled(setting)}
                onChange={this.handleChange}
            />
        );
    }

    buildBannerSetting = (id, setting) => {
        if (this.isDisabled(setting)) {
            return null;
        }
        return (
            <div
                className={'banner ' + setting.banner_type}
                key={this.props.schema.id + '_bool_' + id}
            >
                <div className='banner__content'>
                    <span>{this.renderBanner(setting)}</span>
                </div>
            </div>
        );
    }

    buildGeneratedSetting = (id, setting) => {
        return (
            <GeneratedSetting
                key={this.props.schema.id + '_generated_' + id}
                id={id}
                label={this.renderLabel(setting)}
                helpText={this.renderHelpText(setting)}
                regenerateHelpText={setting.regenerate_help_text}
                placeholder={Utils.localizeMessage(setting.placeholder, setting.placeholder_default)}
                value={this.state[id] || ''}
                disabled={this.isDisabled(setting)}
                onChange={this.handleGeneratedChange}
            />
        );
    }

    handleGeneratedChange = (id, s) => {
        this.handleChange(id, s.replace('+', '-').replace('/', '_'));
    }

    buildUsernameSetting = (id, setting) => {
        return (
            <UserAutocompleteSetting
                key={this.props.schema.id + '_userautocomplete_' + id}
                id={id}
                label={this.renderLabel(setting)}
                helpText={this.renderHelpText(setting)}
                placeholder={Utils.localizeMessage(setting.placeholder, setting.placeholder_default) || Utils.localizeMessage('search_bar.search', 'Search')}
                value={this.state[id] || ''}
                disabled={this.isDisabled(setting)}
                onChange={this.handleChange}
            />
        );
    }

    renderSettings = () => {
        const schema = this.props.schema;

        if (!schema) {
            return <LoadingScreen/>;
        }

        const settingsList = [];
        if (schema.settings) {
            schema.settings.forEach((setting) => {
                settingsList.push(this.buildSetting(setting.key, setting));
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
