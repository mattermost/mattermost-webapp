// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';
import {Overlay, Tooltip} from 'react-bootstrap';

import * as I18n from 'i18n/i18n.jsx';

import {saveConfig} from 'actions/admin_actions.jsx';
import Constants from 'utils/constants.jsx';
import {formatText} from 'utils/text_formatting.jsx';
import {rolesFromMapping, mappingValueFromRoles} from 'utils/policy_roles_adapter';
import * as Utils from 'utils/utils.jsx';
import RequestButton from 'components/admin_console/request_button/request_button';
import LoadingScreen from 'components/loading_screen.jsx';
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
import FileUploadSetting from 'components/admin_console/file_upload_setting.jsx';
import RemoveFileSetting from 'components/admin_console/remove_file_setting.jsx';
import SaveButton from 'components/save_button.jsx';
import FormError from 'components/form_error.jsx';

import FormattedMarkdownMessage from 'components/formatted_markdown_message';

export default class SchemaAdminSettings extends React.Component {
    static propTypes = {
        config: PropTypes.object,
        environmentConfig: PropTypes.object,
        setNavigationBlocked: PropTypes.func,
    }

    constructor(props) {
        super(props);
        this.isPlugin = false;

        this.buildSettingFunctions = {
            [Constants.SettingsTypes.TYPE_TEXT]: this.buildTextSetting,
            [Constants.SettingsTypes.TYPE_LONG_TEXT]: this.buildTextSetting,
            [Constants.SettingsTypes.TYPE_NUMBER]: this.buildTextSetting,
            [Constants.SettingsTypes.TYPE_COLOR]: this.buildColorSetting,
            [Constants.SettingsTypes.TYPE_BOOL]: this.buildBoolSetting,
            [Constants.SettingsTypes.TYPE_PERMISSION]: this.buildPermissionSetting,
            [Constants.SettingsTypes.TYPE_DROPDOWN]: this.buildDropdownSetting,
            [Constants.SettingsTypes.TYPE_RADIO]: this.buildRadioSetting,
            [Constants.SettingsTypes.TYPE_BANNER]: this.buildBannerSetting,
            [Constants.SettingsTypes.TYPE_GENERATED]: this.buildGeneratedSetting,
            [Constants.SettingsTypes.TYPE_USERNAME]: this.buildUsernameSetting,
            [Constants.SettingsTypes.TYPE_BUTTON]: this.buildButtonSetting,
            [Constants.SettingsTypes.TYPE_LANGUAGE]: this.buildLanguageSetting,
            [Constants.SettingsTypes.TYPE_JOBSTABLE]: this.buildJobsTableSetting,
            [Constants.SettingsTypes.TYPE_FILE_UPLOAD]: this.buildFileUploadSetting,
            [Constants.SettingsTypes.TYPE_CUSTOM]: this.buildCustomSetting,
        };
        this.state = {
            saveNeeded: false,
            saving: false,
            serverError: null,
            errorTooltip: false,
        };
    }

    static getDerivedStateFromProps(props, state) {
        if (props.schema && props.schema.id !== state.prevSchemaId) {
            return {
                prevSchemaId: props.schema.id,
                saveNeeded: false,
                saving: false,
                serverError: null,
                errorTooltip: false,
                ...SchemaAdminSettings.getStateFromConfig(props.config, props.schema, props.roles),
            };
        }
        return null;
    }

    handleSubmit = async (e) => {
        e.preventDefault();

        this.setState({
            saving: true,
            serverError: null,
        });

        if (this.state.saveNeeded === 'both' || this.state.saveNeeded === 'permissions') {
            const settings = (this.props.schema && this.props.schema.settings) || [];
            const rolesBinding = settings.reduce((acc, val) => {
                if (val.type === Constants.SettingsTypes.TYPE_PERMISSION) {
                    acc[val.permissions_mapping_name] = this.state[val.key].toString();
                }
                return acc;
            }, {});
            const updatedRoles = rolesFromMapping(rolesBinding, this.props.roles);

            let success = true;

            await Promise.all(Object.values(updatedRoles).map(async (item) => {
                try {
                    await this.props.editRole(item);
                } catch (err) {
                    success = false;
                    this.setState({
                        saving: false,
                        serverError: err.message,
                    });
                }
            }));

            if (!success) {
                return;
            }
        }

        if (this.state.saveNeeded === 'both' || this.state.saveNeeded === 'config') {
            this.doSubmit(null, SchemaAdminSettings.getStateFromConfig);
        } else {
            this.setState({
                saving: false,
                saveNeeded: false,
                serverError: null,
            });
            this.props.setNavigationBlocked(false);
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

                if (setting.type === Constants.SettingsTypes.TYPE_PERMISSION) {
                    this.setConfigValue(config, setting.key, null);
                    return;
                }

                let value = this.getSettingValue(setting);
                const previousValue = SchemaAdminSettings.getConfigValue(config, setting.key);

                if (setting.onConfigSave) {
                    value = setting.onConfigSave(value, previousValue);
                }

                this.setConfigValue(config, setting.key, value);
            });

            if (schema.onConfigSave) {
                return schema.onConfigSave(config, this.props.config);
            }
        }

        return config;
    }

    static getStateFromConfig(config, schema, roles) {
        let state = {};

        if (schema) {
            const settings = schema.settings || [];
            settings.forEach((setting) => {
                if (!setting.key) {
                    return;
                }

                if (setting.type === Constants.SettingsTypes.TYPE_PERMISSION) {
                    try {
                        state[setting.key] = mappingValueFromRoles(setting.permissions_mapping_name, roles) === 'true';
                    } catch (e) {
                        state[setting.key] = false;
                    }
                    return;
                }

                let value = SchemaAdminSettings.getConfigValue(config, setting.key);

                if (setting.onConfigLoad) {
                    value = setting.onConfigLoad(value, config);
                }

                state[setting.key] = value == null ? setting.default : value;
            });

            if (schema.onConfigLoad) {
                state = {...state, ...schema.onConfigLoad(config)};
            }
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
        if (setting.type === Constants.SettingsTypes.TYPE_BOOL) {
            if (this.isDisabled(setting)) {
                return false;
            }
        }
        if (setting.type === Constants.SettingsTypes.TYPE_TEXT && setting.dynamic_value) {
            return setting.dynamic_value(this.state[setting.key], this.props.config, this.state, this.props.license);
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
            if (setting.label_markdown) {
                return (
                    <FormattedMarkdownMessage
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
        let isMarkdown;
        let helpTextValues;
        let helpTextDefault;
        if (setting.disabled_help_text && this.isDisabled(setting)) {
            helpText = setting.disabled_help_text;
            isMarkdown = setting.disabled_help_text_markdown;
            helpTextValues = setting.disabled_help_text_values;
            helpTextDefault = setting.disabled_help_text_default;
        } else {
            helpText = setting.help_text;
            isMarkdown = setting.help_text_markdown;
            helpTextValues = setting.help_text_values;
            helpTextDefault = setting.help_text_default;
        }

        if (typeof helpText === 'string') {
            if (isMarkdown) {
                return (
                    <FormattedMarkdownMessage
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
        if (setting.type === Constants.SettingsTypes.TYPE_NUMBER) {
            inputType = 'number';
        } else if (setting.type === Constants.SettingsTypes.TYPE_LONG_TEXT) {
            inputType = 'textarea';
        }

        let value = this.state[setting.key] || '';
        if (setting.dynamic_value) {
            value = setting.dynamic_value(value, this.props.config, this.state, this.props.license);
        }

        return (
            <TextSetting
                key={this.props.schema.id + '_text_' + setting.key}
                id={setting.key}
                type={inputType}
                label={this.renderLabel(setting)}
                helpText={this.renderHelpText(setting)}
                placeholder={Utils.localizeMessage(setting.placeholder, setting.placeholder_default)}
                value={value}
                disabled={this.isDisabled(setting)}
                setByEnv={this.isSetByEnv(setting.key)}
                onChange={this.handleChange}
                maxLength={setting.max_length}
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

    buildPermissionSetting = (setting) => {
        return (
            <BooleanSetting
                key={this.props.schema.id + '_bool_' + setting.key}
                id={setting.key}
                label={this.renderLabel(setting)}
                helpText={this.renderHelpText(setting)}
                value={(!this.isDisabled(setting) && this.state[setting.key]) || false}
                disabled={this.isDisabled(setting)}
                setByEnv={this.isSetByEnv(setting.key)}
                onChange={this.handlePermissionChange}
            />
        );
    }

    buildDropdownSetting = (setting) => {
        const options = setting.options || [];
        const values = options.map((o) => ({value: o.value, text: Utils.localizeMessage(o.display_name)}));
        const selectedValue = this.state[setting.key] || values[0].value;

        let selectedOptionForHelpText = null;
        for (const option of options) {
            if (option.help_text && option.value === selectedValue) {
                selectedOptionForHelpText = option;
                break;
            }
        }

        return (
            <DropdownSetting
                key={this.props.schema.id + '_dropdown_' + setting.key}
                id={setting.key}
                values={values}
                label={this.renderLabel(setting)}
                helpText={this.renderHelpText(selectedOptionForHelpText || setting)}
                value={selectedValue}
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

    handleChange = (id, value) => {
        let saveNeeded = 'config';
        if (this.state.saveNeeded === 'permissions') {
            saveNeeded = 'both';
        }
        this.setState({
            saveNeeded,
            [id]: value,
        });

        this.props.setNavigationBlocked(true);
    }

    handlePermissionChange = (id, value) => {
        let saveNeeded = 'permissions';
        if (this.state.saveNeeded === 'config') {
            saveNeeded = 'both';
        }
        this.setState({
            saveNeeded,
            [id]: value,
        });

        this.props.setNavigationBlocked(true);
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
                    <FormattedMarkdownMessage
                        id={setting.help_text}
                        defaultMessage={setting.help_text_default}
                    />
                }
            />
        );
    }

    buildFileUploadSetting = (setting) => {
        if (this.state[setting.key]) {
            const removeFile = (id, callback) => {
                const successCallback = () => {
                    this.handleChange(setting.key, '');
                    this.setState({[setting.key]: null, [`${setting.key}Error`]: null});
                };
                const errorCallback = (error) => {
                    callback();
                    this.setState({[setting.key]: null, [`${setting.key}Error`]: error.message});
                };
                setting.remove_action(successCallback, errorCallback);
            };
            return (
                <RemoveFileSetting
                    id={this.props.schema.id}
                    key={this.props.schema.id + '_fileupload_' + setting.key}
                    label={this.renderLabel(setting)}
                    helpText={
                        <FormattedMessage
                            id={setting.remove_help_text}
                            defaultMessage={setting.remove_help_text_default}
                        />
                    }
                    removeButtonText={Utils.localizeMessage(setting.remove_button_text, setting.remove_button_text_default)}
                    removingText={Utils.localizeMessage(setting.removing_text, setting.removing_text_default)}
                    fileName={this.state[setting.key]}
                    onSubmit={removeFile}
                    disabled={this.isDisabled(setting)}
                    setByEnv={this.isSetByEnv(setting.key)}
                />
            );
        }
        const uploadFile = (id, file, callback) => {
            const successCallback = () => {
                const fileName = file.name;
                this.handleChange(id, fileName);
                this.setState({[setting.key]: fileName, [`${setting.key}Error`]: null});
                if (callback && typeof callback === 'function') {
                    callback();
                }
            };
            const errorCallback = (error) => {
                if (callback && typeof callback === 'function') {
                    callback(error.message);
                }
            };
            setting.upload_action(file, successCallback, errorCallback);
        };
        return (
            <FileUploadSetting
                id={setting.key}
                key={this.props.schema.id + '_fileupload_' + setting.key}
                label={this.renderLabel(setting)}
                helpText={this.renderHelpText(setting)}
                uploadingText={Utils.localizeMessage(setting.uploading_text, setting.uploading_text_default)}
                disabled={this.isDisabled(setting)}
                fileType={setting.fileType}
                onSubmit={uploadFile}
                error={this.state.idpCertificateFileError}
                setByEnv={this.isSetByEnv(setting.key)}
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

    closeTooltip = () => {
        this.setState({errorTooltip: false});
    }

    openTooltip = (e) => {
        const elm = e.currentTarget.querySelector('.control-label');
        const isElipsis = elm.offsetWidth < elm.scrollWidth;
        this.setState({errorTooltip: isElipsis});
    }

    doSubmit = (callback, getStateFromConfig) => {
        this.setState({
            saving: true,
            serverError: null,
        });

        // clone config so that we aren't modifying data in the stores
        let config = JSON.parse(JSON.stringify(this.props.config));
        config = this.getConfigFromState(config);

        saveConfig(
            config,
            (savedConfig) => {
                this.setState(getStateFromConfig(savedConfig));

                this.setState({
                    saveNeeded: false,
                    saving: false,
                });

                this.props.setNavigationBlocked(false);

                if (callback) {
                    callback();
                }

                if (this.handleSaved) {
                    this.handleSaved(config);
                }
            },
            (err) => {
                this.setState({
                    saving: false,
                    serverError: err.message,
                    serverErrorId: err.id,
                });

                if (callback) {
                    callback();
                }

                if (this.handleSaved) {
                    this.handleSaved(config);
                }
            }
        );
    };

    static getConfigValue(config, path) {
        const pathParts = path.split('.');

        return pathParts.reduce((obj, pathPart) => {
            if (!obj) {
                return null;
            }

            return obj[pathPart];
        }, config);
    }

    setConfigValue(config, path, value) {
        function setValue(obj, pathParts) {
            const part = pathParts[0];

            if (pathParts.length === 1) {
                obj[part] = value;
            } else {
                if (obj[part] == null) {
                    obj[part] = {};
                }

                setValue(obj[part], pathParts.slice(1));
            }
        }

        setValue(config, path.split('.'));
    }

    isSetByEnv = (path) => {
        return Boolean(SchemaAdminSettings.getConfigValue(this.props.environmentConfig, path));
    };

    render = () => {
        const schema = this.props.schema;

        if (schema && schema.component) {
            const CustomComponent = schema.component;
            return (<CustomComponent {...this.props}/>);
        }
        return (
            <div className='wrapper--fixed'>
                <h3 className='admin-console-header'>
                    {this.renderTitle()}
                </h3>
                <form
                    className='form-horizontal'
                    role='form'
                    onSubmit={this.handleSubmit}
                >
                    {this.renderSettings()}
                    <div className='admin-console-save'>
                        <SaveButton
                            saving={this.state.saving}
                            disabled={!this.state.saveNeeded || (this.canSave && !this.canSave())}
                            onClick={this.handleSubmit}
                            savingMessage={Utils.localizeMessage('admin.saving', 'Saving Config...')}
                        />
                        <div
                            className='error-message'
                            ref='errorMessage'
                            onMouseOver={this.openTooltip}
                            onMouseOut={this.closeTooltip}
                        >
                            <FormError error={this.state.serverError}/>
                        </div>
                        <Overlay
                            show={this.state.errorTooltip}
                            delayShow={Constants.OVERLAY_TIME_DELAY}
                            placement='top'
                            target={this.refs.errorMessage}
                        >
                            <Tooltip id='error-tooltip' >
                                {this.state.serverError}
                            </Tooltip>
                        </Overlay>
                    </div>
                </form>
            </div>
        );
    }
}
