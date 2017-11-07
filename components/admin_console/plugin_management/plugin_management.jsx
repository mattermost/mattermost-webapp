// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedHTMLMessage, FormattedMessage} from 'react-intl';

import * as Utils from 'utils/utils.jsx';

import Banner from 'components/admin_console/banner.jsx';
import LoadingScreen from 'components/loading_screen.jsx';

export default class PluginManagement extends React.Component {
    static propTypes = {

        /*
         * The config
         */
        config: PropTypes.object.isRequired,

        /*
         * Plugins object with ids as keys and manifests as values
         */
        plugins: PropTypes.object.isRequired,

        actions: PropTypes.shape({

            /*
             * Function to upload a plugin
             */
            uploadPlugin: PropTypes.func.isRequired,

            /*
             * Function to remove a plugin
             */
            removePlugin: PropTypes.func.isRequired,

            /*
             * Function to get installed plugins
             */
            getPlugins: PropTypes.func.isRequired,

            /*
             * Function to get installed plugins
             */
            activatePlugin: PropTypes.func.isRequired,

            /*
             * Function to get installed plugins
             */
            deactivatePlugin: PropTypes.func.isRequired
        }).isRequired
    }

    constructor(props) {
        super(props);

        this.state = {
            loading: true,
            fileSelected: false,
            fileName: null,
            serverError: null
        };
    }

    componentDidMount() {
        if (this.props.config.PluginSettings.Enable) {
            this.props.actions.getPlugins().then(
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

    handleRemove = async (pluginId) => {
        this.setState({removing: pluginId});

        const {error} = await this.props.actions.removePlugin(pluginId);
        this.setState({removing: null});

        if (error) {
            this.setState({serverError: error.message});
        }
    }

    handleActivate = async (pluginId) => {
        this.setState({activating: pluginId});

        const {error} = await this.props.actions.activatePlugin(pluginId);
        this.setState({activating: null});

        if (error) {
            this.setState({serverError: error.message});
        }
    }

    handleDeactivate = async (pluginId) => {
        this.setState({deactivating: pluginId});

        const {error} = await this.props.actions.deactivatePlugin(pluginId);
        this.setState({deactivating: null});

        if (error) {
            this.setState({serverError: error.message});
        }
    }

    buildPluginItem = (p) => {
        let activateButton;
        if (p.active) {
            const deactivating = this.state.deactivating === p.id;
            activateButton = (
                <a
                    disabled={deactivating}
                    onClick={() => this.handleDeactivate(p.id)}
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
            const activating = this.state.activating === p.id;
            activateButton = (
                <a
                    disabled={activating}
                    onClick={() => this.handleActivate(p.id)}
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

        let removeButtonText;
        if (this.state.removing === p.id) {
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

        return (
            <div key={p.id}>
                <div>
                    <strong>
                        <FormattedMessage
                            id='admin.plugin.id'
                            defaultMessage='ID:'
                        />
                    </strong>
                    {' ' + p.id}
                </div>
                <div className='padding-top'>
                    <strong>
                        <FormattedMessage
                            id='admin.plugin.desc'
                            defaultMessage='Description:'
                        />
                    </strong>
                    {' ' + p.description}
                </div>
                <div className='padding-top'>
                    {activateButton}
                    {' - '}
                    <a
                        disabled={this.state.removing === p.id}
                        onClick={() => this.handleRemove(p.id)}
                    >
                        {removeButtonText}
                    </a>
                </div>
                <hr/>
            </div>
        );
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
        const plugins = Object.values(this.props.plugins);
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
            pluginsList = plugins.map(this.buildPluginItem);

            pluginsContainer = (
                <div className='alert alert-transparent'>
                    {pluginsList}
                </div>
            );
        }

        const enableUploads = this.props.config.PluginSettings.EnableUploads;
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
                                <FormattedHTMLMessage
                                    id='admin.plugin.uploadDesc'
                                    defaultMessage='Upload a plugin for your Mattermost server. See <a href="https://about.mattermost.com/default-plugin-uploads" target="_blank">documentation</a> to learn more.'
                                />
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
