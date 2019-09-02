// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedHTMLMessage, FormattedMessage} from 'react-intl';
import {Link} from 'react-router-dom';
import PluginState from 'mattermost-redux/constants/plugins';

import * as Utils from 'utils/utils.jsx';
import LoadingScreen from 'components/loading_screen.jsx';
import FormattedMarkdownMessage from 'components/formatted_markdown_message.jsx';
import ConfirmModal from 'components/confirm_modal.jsx';

import AdminSettings from '../admin_settings.jsx';
import BooleanSetting from '../boolean_setting.jsx';
import SettingsGroup from '../settings_group.jsx';

const PluginItemState = ({state}) => {
    switch (state) {
    case PluginState.PLUGIN_STATE_NOT_RUNNING:
        return (
            <FormattedMessage
                id='admin.plugin.state.not_running'
                defaultMessage='Not running'
            />
        );
    case PluginState.PLUGIN_STATE_STARTING:
        return (
            <FormattedMessage
                id='admin.plugin.state.starting'
                defaultMessage='Starting'
            />
        );
    case PluginState.PLUGIN_STATE_RUNNING:
        return (
            <FormattedMessage
                id='admin.plugin.state.running'
                defaultMessage='Running'
            />
        );
    case PluginState.PLUGIN_STATE_FAILED_TO_START:
        return (
            <FormattedMessage
                id='admin.plugin.state.failed_to_start'
                defaultMessage='Failed to start'
            />
        );
    case PluginState.PLUGIN_STATE_FAILED_TO_STAY_RUNNING:
        return (
            <FormattedMessage
                id='admin.plugin.state.failed_to_stay_running'
                defaultMessage='Crashing'
            />
        );
    case PluginState.PLUGIN_STATE_STOPPING:
        return (
            <FormattedMessage
                id='admin.plugin.state.stopping'
                defaultMessage='Stopping'
            />
        );
    default:
        return (
            <FormattedMessage
                id='admin.plugin.state.unknown'
                defaultMessage='Unknown'
            />
        );
    }
};

PluginItemState.propTypes = {
    state: PropTypes.number.isRequired,
};

const PluginItemStateDescription = ({state}) => {
    switch (state) {
    case PluginState.PLUGIN_STATE_NOT_RUNNING:
        return (
            <div className='alert alert-info'>
                <i className='fa fa-ban'/>
                <FormattedMessage
                    id='admin.plugin.state.not_running.description'
                    defaultMessage='This plugin is not enabled.'
                />
            </div>
        );
    case PluginState.PLUGIN_STATE_STARTING:
        return (
            <div className='alert alert-success'>
                <i className='fa fa-info'/>
                <FormattedMessage
                    id='admin.plugin.state.starting.description'
                    defaultMessage='This plugin is starting.'
                />
            </div>
        );
    case PluginState.PLUGIN_STATE_RUNNING:
        return (
            <div className='alert alert-success'>
                <i className='fa fa-check'/>
                <FormattedMessage
                    id='admin.plugin.state.running.description'
                    defaultMessage='This plugin is running.'
                />
            </div>
        );
    case PluginState.PLUGIN_STATE_FAILED_TO_START:
        return (
            <div className='alert alert-warning'>
                <i className='fa fa-warning'/>
                <FormattedMessage
                    id='admin.plugin.state.failed_to_start.description'
                    defaultMessage='This plugin failed to start. Check your system logs for errors.'
                />
            </div>
        );
    case PluginState.PLUGIN_STATE_FAILED_TO_STAY_RUNNING:
        return (
            <div className='alert alert-warning'>
                <i className='fa fa-warning'/>
                <FormattedMessage
                    id='admin.plugin.state.failed_to_stay_running.description'
                    defaultMessage='This plugin crashed multiple times and is no longer running. Check your system logs for errors.'
                />
            </div>
        );
    case PluginState.PLUGIN_STATE_STOPPING:
        return (
            <div className='alert alert-info'>
                <i className='fa fa-info'/>
                <FormattedMessage
                    id='admin.plugin.state.stopping.description'
                    defaultMessage='This plugin is stopping.'
                />
            </div>
        );
    default:
        return null;
    }
};

PluginItemStateDescription.propTypes = {
    state: PropTypes.number.isRequired,
};

const PluginItem = ({
    pluginStatus,
    removing,
    handleEnable,
    handleDisable,
    handleRemove,
    showInstances,
    hasSettings,
}) => {
    let activateButton;
    const activating = pluginStatus.state === PluginState.PLUGIN_STATE_STARTING;
    const deactivating = pluginStatus.state === PluginState.PLUGIN_STATE_STOPPING;

    if (pluginStatus.active) {
        activateButton = (
            <a
                data-plugin-id={pluginStatus.id}
                disabled={deactivating}
                onClick={handleDisable}
            >
                {deactivating ?
                    <FormattedMessage
                        id='admin.plugin.disabling'
                        defaultMessage='Disabling...'
                    /> :
                    <FormattedMessage
                        id='admin.plugin.disable'
                        defaultMessage='Disable'
                    />
                }
            </a>
        );
    } else {
        activateButton = (
            <a
                data-plugin-id={pluginStatus.id}
                disabled={activating}
                onClick={handleEnable}
            >
                {activating ?
                    <FormattedMessage
                        id='admin.plugin.enabling'
                        defaultMessage='Enabling...'
                    /> :
                    <FormattedMessage
                        id='admin.plugin.enable'
                        defaultMessage='Enable'
                    />
                }
            </a>
        );
    }

    let settingsButton = null;
    if (hasSettings) {
        settingsButton = (
            <span>
                {' - '}
                <Link
                    to={'/admin_console/plugins/plugin_' + pluginStatus.id}
                >
                    <FormattedMessage
                        id='admin.plugin.settingsButton'
                        defaultMessage='Settings'
                    />
                </Link>
            </span>
        );
    }

    let removeButton;
    if (!pluginStatus.is_prepackaged) {
        let removeButtonText;
        if (removing) {
            removeButtonText = (
                <FormattedMessage
                    id='admin.plugin.removing'
                    defaultMessage='Removing...'
                />
            );
        } else {
            removeButtonText = (
                <FormattedMessage
                    id='admin.plugin.remove'
                    defaultMessage='Remove'
                />
            );
        }
        removeButton = (
            <span>
                {' - '}
                <a
                    data-plugin-id={pluginStatus.id}
                    disabled={removing}
                    onClick={handleRemove}
                >
                    {removeButtonText}
                </a>
            </span>
        );
    }

    let description;
    if (pluginStatus.description) {
        description = (
            <div className='padding-top'>
                {pluginStatus.description}
            </div>
        );
    }

    let prepackagedLabel;
    if (pluginStatus.is_prepackaged) {
        prepackagedLabel = (
            <span>
                {', '}
                <FormattedMessage
                    id='admin.plugin.prepackaged'
                    defaultMessage='pre-packaged'
                />
            </span>
        );
    }

    const notices = [];
    if (pluginStatus.instances.some((instance) => instance.version !== pluginStatus.version)) {
        notices.push(
            <div
                key='multiple-versions'
                className='alert alert-warning'
            >
                <i className='fa fa-warning'/>
                <FormattedMessage
                    id='admin.plugin.multiple_versions_warning'
                    defaultMessage='There are multiple versions of this plugin installed across your cluster. Re-install this plugin to ensure it works consistently.'
                />
            </div>
        );
    }

    notices.push(
        <PluginItemStateDescription
            key='state-description'
            state={pluginStatus.state}
        />
    );

    const instances = pluginStatus.instances.slice();
    instances.sort((a, b) => {
        if (a.cluster_id < b.cluster_id) {
            return -1;
        } else if (a.cluster_id > b.cluster_id) {
            return 1;
        }

        return 0;
    });

    let clusterSummary;
    if (showInstances) {
        clusterSummary = (
            <div className='padding-top x2 padding-bottom'>
                <div className='row'>
                    <div className='col-md-6'>
                        <strong>
                            <FormattedMessage
                                id='admin.plugin.cluster_instance'
                                defaultMessage='Cluster Instance'
                            />
                        </strong>
                    </div>
                    <div className='col-md-3'>
                        <strong>
                            <FormattedMessage
                                id='admin.plugin.version_title'
                                defaultMessage='Version'
                            />
                        </strong>
                    </div>
                    <div className='col-md-3'>
                        <strong>
                            <FormattedMessage
                                id='admin.plugin.state'
                                defaultMessage='State'
                            />
                        </strong>
                    </div>
                </div>
                {instances.map((instance) => (
                    <div
                        key={instance.cluster_id}
                        className='row'
                    >
                        <div className='col-md-6'>
                            {instance.cluster_id}
                        </div>
                        <div className='col-md-3'>
                            {instance.version}
                        </div>
                        <div className='col-md-3'>
                            <PluginItemState state={instance.state}/>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div>
            <div>
                <strong>{pluginStatus.name}</strong>
                {' ('}
                {pluginStatus.id}
                {' - '}
                {pluginStatus.version}
                {prepackagedLabel}
                {')'}
            </div>
            {description}
            <div className='padding-top'>
                {activateButton}
                {removeButton}
                {settingsButton}
            </div>
            <div>
                {notices}
            </div>
            <div>
                {clusterSummary}
            </div>
            <hr/>
        </div>
    );
};

PluginItem.propTypes = {
    pluginStatus: PropTypes.object.isRequired,
    removing: PropTypes.bool.isRequired,
    handleEnable: PropTypes.func.isRequired,
    handleDisable: PropTypes.func.isRequired,
    handleRemove: PropTypes.func.isRequired,
    showInstances: PropTypes.bool.isRequired,
    hasSettings: PropTypes.bool.isRequired,
};

export default class PluginManagement extends AdminSettings {
    static propTypes = {
        config: PropTypes.object.isRequired,
        pluginStatuses: PropTypes.object.isRequired,
        plugins: PropTypes.object.isRequired,
        actions: PropTypes.shape({
            uploadPlugin: PropTypes.func.isRequired,
            removePlugin: PropTypes.func.isRequired,
            getPlugins: PropTypes.func.isRequired,
            getPluginStatuses: PropTypes.func.isRequired,
            enablePlugin: PropTypes.func.isRequired,
            disablePlugin: PropTypes.func.isRequired,
            installPluginFromUrl: PropTypes.func.isRequired,
        }).isRequired,
    }

    constructor(props) {
        super(props);

        this.getConfigFromState = this.getConfigFromState.bind(this);
        this.renderSettings = this.renderSettings.bind(this);

        this.state = Object.assign(this.state, {
            loading: true,
            fileSelected: false,
            file: null,
            pluginDownloadUrl: '',
            serverError: null,
            lastMessage: null,
            uploading: false,
            installing: false,
            overwritingUpload: false,
            confirmOverwriteUploadModal: false,
            overwritingInstall: false,
            confirmOverwriteInstallModal: false,
        });
    }

    getConfigFromState(config) {
        config.PluginSettings.Enable = this.state.enable;
        config.PluginSettings.EnableUploads = this.state.enableUploads;
        config.PluginSettings.AllowInsecureDownloadUrl = this.state.allowInsecureDownloadUrl;

        return config;
    }

    getStateFromConfig(config) {
        const state = {
            enable: config.PluginSettings.Enable,
            enableUploads: config.PluginSettings.EnableUploads,
            allowInsecureDownloadUrl: config.PluginSettings.AllowInsecureDownloadUrl,
        };

        return state;
    }

    componentDidMount() {
        if (this.state.enable) {
            this.props.actions.getPluginStatuses().then(
                () => this.setState({loading: false})
            );
        }
    }

    handleUpload = () => {
        this.setState({lastMessage: null, serverError: null});
        const element = this.refs.fileInput;
        if (element.files.length > 0) {
            this.setState({fileSelected: true, file: element.files[0]});
        }
    }

    helpSubmitUpload = async (file, force) => {
        this.setState({uploading: true});
        const {error} = await this.props.actions.uploadPlugin(file, force);

        if (error) {
            if (error.server_error_id === 'app.plugin.install_id.app_error' && !force) {
                this.setState({confirmOverwriteUploadModal: true, overwritingUpload: true});
                return;
            }
            this.setState({
                file: null,
                fileSelected: false,
                uploading: false,
            });
            if (error.server_error_id === 'app.plugin.activate.app_error') {
                this.setState({serverError: Utils.localizeMessage('admin.plugin.error.activate', 'Unable to upload the plugin. It may conflict with another plugin on your server.')});
            } else if (error.server_error_id === 'app.plugin.extract.app_error') {
                this.setState({serverError: Utils.localizeMessage('admin.plugin.error.extract', 'Encountered an error when extracting the plugin. Review your plugin file content and try again.')});
            } else {
                this.setState({serverError: error.message});
            }
            this.setState({file: null, fileSelected: false});
            return;
        }

        this.setState({loading: true});
        await this.props.actions.getPlugins();

        let msg = `Successfully uploaded plugin from ${file.name}`;
        if (this.state.overwritingUpload) {
            msg = `Successfully updated plugin from ${file.name}`;
        }

        this.setState({
            file: null,
            fileSelected: false,
            serverError: null,
            lastMessage: msg,
            overwritingUpload: false,
            uploading: false,
            loading: false,
        });
    }

    handleSubmitUpload = (e) => {
        e.preventDefault();

        const element = this.refs.fileInput;
        if (element.files.length === 0) {
            return;
        }
        const file = element.files[0];

        this.helpSubmitUpload(file, false);
        Utils.clearFileInput(element);
    }

    handleOverwriteUploadPluginCancel = () => {
        this.setState({
            file: null,
            fileSelected: false,
            serverError: null,
            confirmOverwriteUploadModal: false,
            lastMessage: null,
            uploading: false,
        });
    }

    handleOverwriteUploadPlugin = () => {
        this.setState({confirmOverwriteUploadModal: false});
        this.helpSubmitUpload(this.state.file, true);
    }

    onPluginDownloadUrlChange = (e) => {
        this.setState({
            pluginDownloadUrl: e.target.value,
        });
    }

    installFromUrl = async (force) => {
        const {pluginDownloadUrl} = this.state;

        this.setState({
            installing: true,
            serverError: null,
            lastMessage: null,
        });
        const {error} = await this.props.actions.installPluginFromUrl(pluginDownloadUrl, force);

        if (error) {
            if (error.server_error_id === 'app.plugin.install_id.app_error' && !force) {
                this.setState({confirmOverwriteInstallModal: true, overwritingInstall: true});
                return;
            }

            this.setState({
                installing: false,
            });

            if (error.server_error_id === 'app.plugin.extract.app_error') {
                this.setState({serverError: Utils.localizeMessage('admin.plugin.error.extract', 'Encountered an error when extracting the plugin. Review your plugin file content and try again.')});
            } else {
                this.setState({serverError: error.message});
            }
            return;
        }

        this.setState({loading: true});
        await this.props.actions.getPlugins();

        let msg = `Successfully installed plugin from ${pluginDownloadUrl}`;
        if (this.state.overwritingInstall) {
            msg = `Successfully updated plugin from ${pluginDownloadUrl}`;
        }

        this.setState({
            serverError: null,
            lastMessage: msg,
            overwritingInstall: false,
            installing: false,
            loading: false,
        });
    }

    handleSubmitInstall = (e) => {
        e.preventDefault();
        return this.installFromUrl(false);
    }

    handleOverwriteInstallPluginCancel = () => {
        this.setState({
            confirmOverwriteInstallModal: false,
            installing: false,
            serverError: null,
            lastMessage: null,
        });
    }

    handleOverwriteInstallPlugin = () => {
        this.setState({confirmOverwriteInstallModal: false});
        return this.installFromUrl(true);
    }

    handleRemove = async (e) => {
        this.setState({lastMessage: null, serverError: null});
        e.preventDefault();
        const pluginId = e.currentTarget.getAttribute('data-plugin-id');
        this.setState({removing: pluginId});

        const {error} = await this.props.actions.removePlugin(pluginId);
        this.setState({removing: null});

        if (error) {
            this.setState({serverError: error.message});
        }
    }

    handleEnable = async (e) => {
        e.preventDefault();
        this.setState({lastMessage: null, serverError: null});
        const pluginId = e.currentTarget.getAttribute('data-plugin-id');

        const {error} = await this.props.actions.enablePlugin(pluginId);

        if (error) {
            this.setState({serverError: error.message});
        }
    }

    handleDisable = async (e) => {
        this.setState({lastMessage: null, serverError: null});
        e.preventDefault();
        const pluginId = e.currentTarget.getAttribute('data-plugin-id');

        const {error} = await this.props.actions.disablePlugin(pluginId);

        if (error) {
            this.setState({serverError: error.message});
        }
    }

    renderTitle() {
        return (
            <FormattedMessage
                id='admin.plugin.management.title'
                defaultMessage='Management'
            />
        );
    }

    renderOverwritePluginModal = ({show, onConfirm, onCancel}) => {
        const title = (
            <FormattedMessage
                id='admin.plugin.upload.overwrite_modal.title'
                defaultMessage='Overwrite existing plugin?'
            />
        );

        const message = (
            <FormattedMessage
                id='admin.plugin.upload.overwrite_modal.desc'
                defaultMessage='A plugin with this ID already exists. Would you like to overwrite it?'
            />
        );

        const overwriteButton = (
            <FormattedMessage
                id='admin.plugin.upload.overwrite_modal.overwrite'
                defaultMessage='Overwrite'
            />
        );

        return (
            <ConfirmModal
                show={show}
                title={title}
                message={message}
                confirmButtonClass='btn btn-danger'
                confirmButtonText={overwriteButton}
                onConfirm={onConfirm}
                onCancel={onCancel}
            />
        );
    }

    renderEnablePluginsSetting = () => {
        const hideEnablePlugins = this.props.config.ExperimentalSettings.RestrictSystemAdmin;
        if (!hideEnablePlugins) {
            return (
                <BooleanSetting
                    id='enable'
                    label={
                        <FormattedMessage
                            id='admin.plugins.settings.enable'
                            defaultMessage='Enable Plugins: '
                        />
                    }
                    helpText={
                        <FormattedMarkdownMessage
                            id='admin.plugins.settings.enableDesc'
                            defaultMessage='When true, enables plugins on your Mattermost server. Use plugins to integrate with third-party systems, extend functionality, or customize the user interface of your Mattermost server. See [documentation](https://about.mattermost.com/default-plugin-uploads) to learn more.'
                        />
                    }
                    value={this.state.enable}
                    onChange={this.handleChange}
                    setByEnv={this.isSetByEnv('PluginSettings.Enable')}
                />
            );
        }
        return null;
    }

    renderSettings() {
        const {enableUploads} = this.state;
        const enable = this.props.config.PluginSettings.Enable;
        let serverError = '';
        let lastMessage = '';

        if (this.state.serverError) {
            serverError = <div className='col-sm-12'><div className='form-group has-error half'><label className='control-label'>{this.state.serverError}</label></div></div>;
        }
        if (this.state.lastMessage) {
            lastMessage = <div className='col-sm-12'><div className='form-group half'>{this.state.lastMessage}</div></div>;
        }

        let btnClass = 'btn';
        if (this.state.fileSelected) {
            btnClass = 'btn btn-primary';
        }

        let fileName;
        if (this.state.file) {
            fileName = this.state.file.name;
        }

        let uploadButtonText;
        if (this.state.uploading) {
            uploadButtonText = (
                <FormattedMessage
                    id='admin.plugin.uploading'
                    defaultMessage='Uploading...'
                />
            );
        } else {
            uploadButtonText = (
                <FormattedMessage
                    id='admin.plugin.upload'
                    defaultMessage='Upload'
                />
            );
        }

        let pluginsList;
        let pluginsContainer;
        let pluginsListContainer;
        const plugins = Object.values(this.props.pluginStatuses);
        if (this.state.loading) {
            pluginsList = <LoadingScreen/>;
        } else if (plugins.length === 0) {
            pluginsListContainer = (
                <FormattedMessage
                    id='admin.plugin.no_plugins'
                    defaultMessage='No installed plugins.'
                />
            );
        } else {
            const showInstances = plugins.some((pluginStatus) => pluginStatus.instances.length > 1);
            plugins.sort((a, b) => {
                if (a.name < b.name) {
                    return -1;
                } else if (a.name > b.name) {
                    return 1;
                }

                return 0;
            });

            pluginsList = plugins.map((pluginStatus) => {
                const p = this.props.plugins[pluginStatus.id];
                const hasSettings = Boolean(p && p.settings_schema && (p.settings_schema.header || p.settings_schema.footer || (p.settings_schema.settings && p.settings_schema.settings.length > 0)));
                return (
                    <PluginItem
                        key={pluginStatus.id}
                        pluginStatus={pluginStatus}
                        removing={this.state.removing === pluginStatus.id}
                        handleEnable={this.handleEnable}
                        handleDisable={this.handleDisable}
                        handleRemove={this.handleRemove}
                        showInstances={showInstances}
                        hasSettings={hasSettings}
                    />
                );
            });

            pluginsListContainer = (
                <div className='alert alert-transparent'>
                    {pluginsList}
                </div>
            );
        }

        if (enable) {
            pluginsContainer = (
                <div className='form-group'>
                    <label
                        className='control-label col-sm-4'
                    >
                        <FormattedMessage
                            id='admin.plugin.installedTitle'
                            defaultMessage='Installed Plugins: '
                        />
                    </label>
                    <div className='col-sm-8'>
                        <p className='help-text'>
                            <FormattedHTMLMessage
                                id='admin.plugin.installedDesc'
                                defaultMessage='Installed plugins on your Mattermost server. Pre-packaged plugins are installed by default, and can be disabled but not removed.'
                            />
                        </p>
                        <br/>
                        {pluginsListContainer}
                    </div>
                </div>
            );
        }

        let uploadHelpText;

        if (enableUploads && enable) {
            uploadHelpText = (
                <FormattedMarkdownMessage
                    id='admin.plugin.uploadDesc'
                    defaultMessage='Upload a plugin for your Mattermost server. See [documentation](!https://about.mattermost.com/default-plugin-uploads) to learn more.'
                />
            );
        } else if (enable === true && enableUploads === false) {
            uploadHelpText = (
                <FormattedMarkdownMessage
                    id='admin.plugin.uploadDisabledDesc'
                    defaultMessage='Enable plugin uploads in config.json. See [documentation](!https://about.mattermost.com/default-plugin-uploads) to learn more.'
                />
            );
        } else {
            uploadHelpText = (
                <FormattedMarkdownMessage
                    id='admin.plugin.uploadAndPluginDisabledDesc'
                    defaultMessage='To enable plugins, set **Enable Plugins** to true. See [documentation](!https://about.mattermost.com/default-plugin-uploads) to learn more.'
                />
            );
        }

        const uploadBtnClass = enableUploads ? 'btn btn-primary' : 'btn';

        const overwriteUploadPluginModal = this.state.confirmOverwriteUploadModal && this.renderOverwritePluginModal({
            show: this.state.confirmOverwriteUploadModal,
            onConfirm: this.handleOverwriteUploadPlugin,
            onCancel: this.handleOverwriteUploadPluginCancel,
        });

        return (
            <div className='admin-console__wrapper'>
                <div className='admin-console__content'>
                    <SettingsGroup
                        id={'PluginSettings'}
                        container={false}
                    >
                        {this.renderEnablePluginsSetting()}

                        <div className='form-group'>
                            <label
                                className='control-label col-sm-4'
                            >
                                <FormattedMessage
                                    id='admin.plugin.uploadTitle'
                                    defaultMessage='Upload Plugin: '
                                />
                            </label>
                            <div className='col-sm-8'>
                                <div className='file__upload'>
                                    <button
                                        className={uploadBtnClass}
                                        disabled={!enableUploads || !enable}
                                    >
                                        <FormattedMessage
                                            id='admin.plugin.choose'
                                            defaultMessage='Choose File'
                                        />
                                    </button>
                                    <input
                                        ref='fileInput'
                                        type='file'
                                        accept='.gz'
                                        onChange={this.handleUpload}
                                        disabled={!enableUploads || !enable}
                                    />
                                </div>
                                <button
                                    className={btnClass}
                                    disabled={!this.state.fileSelected}
                                    onClick={this.handleSubmitUpload}
                                >
                                    {uploadButtonText}
                                </button>
                                <div className='help-text no-margin'>
                                    {fileName}
                                </div>
                                {serverError}
                                {lastMessage}
                                <p className='help-text'>
                                    {uploadHelpText}
                                </p>
                            </div>
                        </div>
                        {pluginsContainer}
                    </SettingsGroup>
                    {overwriteUploadPluginModal}
                </div>
            </div>
        );
    }
}
