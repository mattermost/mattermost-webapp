// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedHTMLMessage, FormattedMessage} from 'react-intl';
import {Link} from 'react-router-dom';
import PluginState from 'mattermost-redux/constants/plugins';

import * as Utils from 'utils/utils.jsx';
import Banner from 'components/admin_console/banner.jsx';
import LoadingScreen from 'components/loading_screen.jsx';

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
                    defaultMessage='This plugin is not activated.'
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
    handleActivate,
    handleDeactivate,
    handleRemove,
    showInstances,
}) => {
    let activateButton;
    const activating = pluginStatus.state === PluginState.PLUGIN_STATE_STARTING;
    const deactivating = pluginStatus.state === PluginState.PLUGIN_STATE_STOPPING;
    if (pluginStatus.active) {
        activateButton = (
            <a
                data-plugin-id={pluginStatus.id}
                disabled={deactivating}
                onClick={handleDeactivate}
            >
                {deactivating ?
                    <FormattedMessage
                        id='admin.plugin.deactivating'
                        defaultMessage='Deactivating...'
                    /> :
                    <FormattedMessage
                        id='admin.plugin.deactivate'
                        defaultMessage='Deactivate'
                    />
                }
            </a>
        );
    } else {
        activateButton = (
            <a
                data-plugin-id={pluginStatus.id}
                disabled={activating}
                onClick={handleActivate}
            >
                {activating ?
                    <FormattedMessage
                        id='admin.plugin.activating'
                        defaultMessage='Activating...'
                    /> :
                    <FormattedMessage
                        id='admin.plugin.activate'
                        defaultMessage='Activate'
                    />
                }
            </a>
        );
    }

    let settingsButton;
    if (pluginStatus.settings_schema) {
        settingsButton = (
            <span>
                {' - '}
                <Link
                    to={'/admin_console/plugins/custom/' + pluginStatus.id}
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

    const instances = pluginStatus.instances;
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
    handleActivate: PropTypes.func.isRequired,
    handleDeactivate: PropTypes.func.isRequired,
    handleRemove: PropTypes.func.isRequired,
    showInstances: PropTypes.bool.isRequired,
};

export default class PluginManagement extends React.Component {
    static propTypes = {
        config: PropTypes.object.isRequired,
        pluginStatuses: PropTypes.object.isRequired,
        actions: PropTypes.shape({
            uploadPlugin: PropTypes.func.isRequired,
            removePlugin: PropTypes.func.isRequired,
            getPluginStatuses: PropTypes.func.isRequired,
            activatePlugin: PropTypes.func.isRequired,
            deactivatePlugin: PropTypes.func.isRequired,
        }).isRequired,
    }

    constructor(props) {
        super(props);

        this.state = {
            loading: true,
            fileSelected: false,
            fileName: null,
            serverError: null,
        };
    }

    componentDidMount() {
        if (this.props.config.PluginSettings.Enable) {
            this.props.actions.getPluginStatuses().then(
                () => this.setState({loading: false})
            );
        }
    }

    handleChange = () => {
        const element = this.refs.fileInput;
        if (element.files.length > 0) {
            this.setState({fileSelected: true, fileName: element.files[0].name});
        }
    }

    handleSubmit = async (e) => {
        e.preventDefault();

        const element = this.refs.fileInput;
        if (element.files.length === 0) {
            return;
        }
        const file = element.files[0];

        this.setState({uploading: true});

        const {error} = await this.props.actions.uploadPlugin(file);
        this.setState({fileSelected: false, fileName: null, uploading: false, serverError: null});
        Utils.clearFileInput(element);

        if (error) {
            if (error.server_error_id === 'app.plugin.activate.app_error') {
                this.setState({serverError: Utils.localizeMessage('admin.plugin.error.activate', 'Unable to upload the plugin. It may conflict with another plugin on your server.')});
            } else if (error.server_error_id === 'app.plugin.extract.app_error') {
                this.setState({serverError: Utils.localizeMessage('admin.plugin.error.extract', 'Encountered an error when extracting the plugin. Review your plugin file content and try again.')});
            } else {
                this.setState({serverError: error.message});
            }
        }
    }

    handleRemove = async (e) => {
        e.preventDefault();
        const pluginId = e.currentTarget.getAttribute('data-plugin-id');
        this.setState({removing: pluginId});

        const {error} = await this.props.actions.removePlugin(pluginId);
        this.setState({removing: null});

        if (error) {
            this.setState({serverError: error.message});
        }
    }

    handleActivate = async (e) => {
        e.preventDefault();
        const pluginId = e.currentTarget.getAttribute('data-plugin-id');

        const {error} = await this.props.actions.activatePlugin(pluginId);

        if (error) {
            this.setState({serverError: error.message});
        }
    }

    handleDeactivate = async (e) => {
        e.preventDefault();
        const pluginId = e.currentTarget.getAttribute('data-plugin-id');

        const {error} = await this.props.actions.deactivatePlugin(pluginId);

        if (error) {
            this.setState({serverError: error.message});
        }
    }

    render() {
        if (!this.props.config.PluginSettings.Enable) {
            return (
                <div className='wrapper--fixed'>
                    <h3 className='admin-console-header'>
                        <FormattedMessage
                            id='admin.plugin.management.title'
                            defaultMessage='Management'
                        />
                    </h3>
                    <Banner
                        title={<div/>}
                        description={
                            <FormattedHTMLMessage
                                id='admin.plugin.management.banner'
                                defaultMessage='Plugins are disabled on your server. To enable them, go to <strong>Plugins > Configuration</strong>.'
                            />
                        }
                    />
                </div>
            );
        }

        let serverError = '';
        if (this.state.serverError) {
            serverError = <div className='col-sm-12'><div className='form-group has-error half'><label className='control-label'>{this.state.serverError}</label></div></div>;
        }

        let btnClass = 'btn';
        if (this.state.fileSelected) {
            btnClass = 'btn btn-primary';
        }

        let fileName;
        if (this.state.fileName) {
            fileName = this.state.fileName;
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
        const plugins = Object.values(this.props.pluginStatuses);
        if (this.state.loading) {
            pluginsList = <LoadingScreen/>;
        } else if (plugins.length === 0) {
            pluginsContainer = (
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
            pluginsList = plugins.map((pluginStatus) => (
                <PluginItem
                    key={pluginStatus.id}
                    pluginStatus={pluginStatus}
                    removing={this.state.removing === pluginStatus.id}
                    handleActivate={this.handleActivate}
                    handleDeactivate={this.handleDeactivate}
                    handleRemove={this.handleRemove}
                    showInstances={showInstances}
                />
            ));

            pluginsContainer = (
                <div className='alert alert-transparent'>
                    {pluginsList}
                </div>
            );
        }

        const enableUploads = this.props.config.PluginSettings.EnableUploads;
        let uploadHelpText;
        if (enableUploads) {
            uploadHelpText = (
                <FormattedHTMLMessage
                    id='admin.plugin.uploadDesc'
                    defaultMessage='Upload a plugin for your Mattermost server. See <a href="https://about.mattermost.com/default-plugin-uploads" target="_blank">documentation</a> to learn more.'
                />
            );
        } else {
            uploadHelpText = (
                <FormattedHTMLMessage
                    id='admin.plugin.uploadDisabledDesc'
                    defaultMessage='To enable plugin uploads, go to <strong>Plugins > Configuration</strong>. See <a href="https://about.mattermost.com/default-plugin-uploads" target="_blank">documentation</a> to learn more.'
                />
            );
        }

        const uploadBtnClass = enableUploads ? 'btn btn-primary' : 'btn';

        return (
            <div className='wrapper--fixed'>
                <h3 className='admin-console-header'>
                    <FormattedMessage
                        id='admin.plugin.management.title'
                        defaultMessage='Management'
                    />
                </h3>
                <form
                    className='form-horizontal'
                    role='form'
                >
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
                                    disabled={!enableUploads}
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
                                    onChange={this.handleChange}
                                    disabled={!enableUploads}
                                />
                            </div>
                            <button
                                className={btnClass}
                                disabled={!this.state.fileSelected}
                                onClick={this.handleSubmit}
                            >
                                {uploadButtonText}
                            </button>
                            <div className='help-text no-margin'>
                                {fileName}
                            </div>
                            {serverError}
                            <p className='help-text'>
                                {uploadHelpText}
                            </p>
                        </div>
                    </div>
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
                                    defaultMessage='Installed plugins on your Mattermost server. Pre-packaged plugins are installed by default, and can be deactivated but not removed.'
                                />
                            </p>
                            <br/>
                            {pluginsContainer}
                        </div>
                    </div>
                </form>
            </div>
        );
    }
}
