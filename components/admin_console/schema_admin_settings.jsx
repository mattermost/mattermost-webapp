// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

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
import ColorSetting from 'components/admin_console/color_setting.jsx';
import GeneratedSetting from 'components/admin_console/generated_setting.jsx';
import UserAutocompleteSetting from 'components/admin_console/user_autocomplete_setting.jsx';
import SettingsGroup from 'components/admin_console/settings_group.jsx';
import JobsTable from 'components/admin_console/jobs';

export default class SchemaAdminSettings extends AdminSettings {
    constructor(props) {
        super(props);
        this.buildSettingFunctions = {
            [SettingsTypes.TYPE_TEXT]: this.buildTextSetting,
            [SettingsTypes.TYPE_NUMBER]: this.buildTextSetting,
            [SettingsTypes.TYPE_COLOR]: this.buildColorSetting,
            [SettingsTypes.TYPE_BOOL]: this.buildBoolSetting,
            [SettingsTypes.TYPE_DROPDOWN]: this.buildDropdownSetting,
            [SettingsTypes.TYPE_RADIO]: this.buildRadioSetting,
            [SettingsTypes.TYPE_BANNER]: this.buildBannerSetting,
            [SettingsTypes.TYPE_GENERATED]: this.buildGeneratedSetting,
            [SettingsTypes.TYPE_USERNAME]: this.buildUsernameSetting,
            [SettingsTypes.TYPE_BUTTON]: this.buildButtonSetting,
            [SettingsTypes.TYPE_LANGUAGE]: this.buildLanguageSetting,
            [SettingsTypes.TYPE_JOBSTABLE]: this.buildJobsTableSetting,
            [SettingsTypes.TYPE_CUSTOM]: this.buildCustomSetting,
        };
    }

    UNSAFE_componentWillReceiveProps(nextProps) { // eslint-disable-line camelcase
        if (nextProps.schema !== this.props.schema) {
            this.setState(this.getStateFromConfig(nextProps.config, nextProps.schema));
        }
    }

    getConfigFromState(config) {
        const schema = this.props.schema;

        if (schema) {
            const settings = schema.settings || [];
            settings.forEach((setting) => {
                if (!setting.key) {
                    return;
                }

                let value = this.getSettingValue(setting);

                if (setting.onConfigSave) {
                    value = setting.onConfigSave(value);
                }

                this.setConfigValue(config, setting.key, value);
            });
        }

        return config;
    }

    getStateFromConfig(config, schema = this.props.schema) {
        const state = {};

        if (schema) {
            const settings = schema.settings || [];
            settings.forEach((setting) => {
                if (!setting.key) {
                    return;
                }

                let value = this.getConfigValue(config, setting.key);

                if (setting.onConfigLoad) {
                    value = setting.onConfigLoad(value);
                }

                state[setting.key] = value == null ? setting.default : value;
            });
        }

        return state;
    }

    getSetting(key) {
        for (const setting of this.props.schema.settings) {
            if (setting.key === key) {
                return setting;
            }
        }

        return null;
    }

    getSettingValue(setting) {
        // Force boolean values to false when disabled.
        if (setting.type === SettingsTypes.TYPE_BOOL) {
            if (this.isDisabled(setting)) {
                return false;
            }
        }

        return this.state[setting.key];
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

        let helpText;
        let isHTML;
        let helpTextValues;
        let helpTextDefault;
        if (setting.disabled_help_text && this.isDisabled(setting)) {
            helpText = setting.disabled_help_text;
            isHTML = setting.disabled_help_text_html;
            helpTextValues = setting.disabled_help_text_values;
            helpTextDefault = setting.disabled_help_text_default;
        } else {
            helpText = setting.help_text;
            isHTML = setting.help_text_html;
            helpTextValues = setting.help_text_values;
            helpTextDefault = setting.help_text_default;
        }

        if (typeof helpText === 'string') {
            if (isHTML) {
                return (
                    <FormattedHTMLMessage
                        id={helpText}
                        values={helpTextValues}
                        defaultMessage={helpTextDefault}
                    />
                );
            }
            return (
                <FormattedMessage
                    id={helpText}
                    defaultMessage={helpTextDefault}
                    values={helpTextValues}
                />
            );
        }

        return helpText;
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
        if (!setting.isDisabled || typeof setting.isDisabled !== 'function') {
            return false;
        }

        return setting.isDisabled(this.props.config, this.state, this.props.license);
    }

    isHidden = (setting) => {
        if (!setting.isHidden || typeof setting.isHidden !== 'function') {
            return false;
        }

        return setting.isHidden(this.props.config, this.state, this.props.license);
    }

    buildButtonSetting = (setting) => {
        return (
            <RequestButton
                key={this.props.schema.id + '_text_' + setting.key}
                requestAction={setting.action}
                helpText={this.renderHelpText(setting)}
                loadingText={Utils.localizeMessage(setting.loading, setting.loading_default)}
                buttonText={<span>{this.renderLabel(setting)}</span>}
                showSuccessMessage={Boolean(setting.success_message)}
                includeDetailedError={true}
                errorMessage={{
                    id: setting.error_message,
                    defaultMessage: setting.error_message_default,
                }}
                successMessage={setting.success_message && {
                    id: setting.success_message,
                    defaultMessage: setting.success_message_default,
                }}
            />
        );
    }

    buildTextSetting = (setting) => {
        let inputType = 'input';
        if (setting.type === SettingsTypes.TYPE_NUMBER) {
            inputType = 'number';
        }
        return (
            <TextSetting
                key={this.props.schema.id + '_text_' + setting.key}
                id={setting.key}
                type={inputType}
                label={this.renderLabel(setting)}
                helpText={this.renderHelpText(setting)}
                placeholder={Utils.localizeMessage(setting.placeholder, setting.placeholder_default)}
                value={this.state[setting.key] || ''}
                disabled={this.isDisabled(setting)}
                setByEnv={this.isSetByEnv(setting.key)}
                onChange={this.handleChange}
            />
        );
    }

    buildColorSetting = (setting) => {
        return (
            <ColorSetting
                key={this.props.schema.id + '_text_' + setting.key}
                id={setting.key}
                label={this.renderLabel(setting)}
                helpText={this.renderHelpText(setting)}
                placeholder={Utils.localizeMessage(setting.placeholder, setting.placeholder_default)}
                value={this.state[setting.key] || ''}
                disabled={this.isDisabled(setting)}
                onChange={this.handleChange}
            />
        );
    }

    buildBoolSetting = (setting) => {
        return (
            <BooleanSetting
                key={this.props.schema.id + '_bool_' + setting.key}
                id={setting.key}
                label={this.renderLabel(setting)}
                helpText={this.renderHelpText(setting)}
                value={(!this.isDisabled(setting) && this.state[setting.key]) || false}
                disabled={this.isDisabled(setting)}
                setByEnv={this.isSetByEnv(setting.key)}
                onChange={this.handleChange}
            />
        );
    }

    buildDropdownSetting = (setting) => {
        const options = setting.options || [];
        const values = options.map((o) => ({value: o.value, text: Utils.localizeMessage(o.display_name)}));

        return (
            <DropdownSetting
                key={this.props.schema.id + '_dropdown_' + setting.key}
                id={setting.key}
                values={values}
                label={this.renderLabel(setting)}
                helpText={this.renderHelpText(setting)}
                value={this.state[setting.key] || values[0].value}
                disabled={this.isDisabled(setting)}
                setByEnv={this.isSetByEnv(setting.key)}
                onChange={this.handleChange}
            />
        );
    }

    buildLanguageSetting = (setting) => {
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
                    key={this.props.schema.id + '_language_' + setting.key}
                    id={setting.key}
                    label={this.renderLabel(setting)}
                    values={values}
                    helpText={this.renderHelpText(setting)}
                    selected={(this.state[setting.key] && this.state[setting.key].split(',')) || []}
                    disabled={this.isDisabled(setting)}
                    setByEnv={this.isSetByEnv(setting.key)}
                    onChange={(changedId, value) => this.handleChange(changedId, value.join(','))}
                    noResultText={noResultText}
                    notPresent={notPresent}
                />
            );
        }
        return (
            <DropdownSetting
                key={this.props.schema.id + '_language_' + setting.key}
                id={setting.key}
                label={this.renderLabel(setting)}
                values={values}
                helpText={this.renderHelpText(setting)}
                value={this.state[setting.key] || values[0].value}
                disabled={this.isDisabled(setting)}
                setByEnv={this.isSetByEnv(setting.key)}
                onChange={this.handleChange}
            />
        );
    }

    buildRadioSetting = (setting) => {
        const options = setting.options || [];
        const values = options.map((o) => ({value: o.value, text: o.display_name}));

        return (
            <RadioSetting
                key={this.props.schema.id + '_radio_' + setting.key}
                id={setting.key}
                values={values}
                label={this.renderLabel(setting)}
                helpText={this.renderHelpText(setting)}
                value={this.state[setting.key] || values[0]}
                disabled={this.isDisabled(setting)}
                setByEnv={this.isSetByEnv(setting.key)}
                onChange={this.handleChange}
            />
        );
    }

    buildBannerSetting = (setting) => {
        if (this.isDisabled(setting)) {
            return null;
        }
        return (
            <div
                className={'banner ' + setting.banner_type}
                key={this.props.schema.id + '_bool_' + setting.key}
            >
                <div className='banner__content'>
                    <span>{this.renderBanner(setting)}</span>
                </div>
            </div>
        );
    }

    buildGeneratedSetting = (setting) => {
        return (
            <GeneratedSetting
                key={this.props.schema.id + '_generated_' + setting.key}
                id={setting.key}
                label={this.renderLabel(setting)}
                helpText={this.renderHelpText(setting)}
                regenerateHelpText={setting.regenerate_help_text}
                placeholder={Utils.localizeMessage(setting.placeholder, setting.placeholder_default)}
                value={this.state[setting.key] || ''}
                disabled={this.isDisabled(setting)}
                setByEnv={this.isSetByEnv(setting.key)}
                onChange={this.handleGeneratedChange}
            />
        );
    }

    handleGeneratedChange = (id, s) => {
        this.handleChange(id, s.replace('+', '-').replace('/', '_'));
    }

    buildUsernameSetting = (setting) => {
        return (
            <UserAutocompleteSetting
                key={this.props.schema.id + '_userautocomplete_' + setting.key}
                id={setting.key}
                label={this.renderLabel(setting)}
                helpText={this.renderHelpText(setting)}
                placeholder={Utils.localizeMessage(setting.placeholder, setting.placeholder_default) || Utils.localizeMessage('search_bar.search', 'Search')}
                value={this.state[setting.key] || ''}
                disabled={this.isDisabled(setting)}
                onChange={this.handleChange}
            />
        );
    }

    buildJobsTableSetting = (setting) => {
        return (
            <JobsTable
                key={this.props.schema.id + '_userautocomplete_' + setting.key}
                jobType={setting.job_type}
                getExtraInfoText={setting.render_job}
                disabled={this.isDisabled(setting)}
                createJobButtonText={
                    <FormattedMessage
                        id={setting.label}
                        defaultMessage={setting.label_default}
                    />
                }
                createJobHelpText={
                    <FormattedMessage
                        id={setting.help_text}
                        defaultMessage={setting.help_text_default}
                    />
                }
            />
        );
    }

    buildCustomSetting = (setting) => {
        const CustomComponent = setting.component;
        return (
            <CustomComponent
                key={this.props.schema.id + '_userautocomplete_' + setting.key}
                id={setting.key}
                value={this.state[setting.key] || ''}
                disabled={this.isDisabled(setting)}
                setByEnv={this.isSetByEnv(setting.key)}
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
                if (this.buildSettingFunctions[setting.type] && !this.isHidden(setting)) {
                    // This is a hack required as plugin settings are case insensitive
                    let s = setting;
                    if (this.isPlugin) {
                        s = {...setting, key: setting.key.toLowerCase()};
                    }
                    settingsList.push(this.buildSettingFunctions[setting.type](s));
                }
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

    render = () => {
        const schema = this.props.schema;

        if (schema && schema.component) {
            const CustomComponent = schema.component;
            return (<CustomComponent {...this.props}/>);
        }
        return AdminSettings.prototype.render.call(this);
    }
}
