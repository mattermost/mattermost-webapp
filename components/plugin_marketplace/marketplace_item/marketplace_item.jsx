// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import {FormattedMessage} from 'react-intl';

import {Link} from 'react-router-dom';

import LoadingWrapper from 'components/widgets/loading/loading_wrapper.tsx';
import ConfirmModal from 'components/confirm_modal.jsx';
import PluginIcon from 'components/widgets/icons/plugin_icon.jsx';

import {trackEvent} from 'actions/diagnostics_actions.jsx';
import {localizeMessage} from 'utils/utils';

export default class MarketplaceItem extends React.Component {
        static propTypes = {
            id: PropTypes.string.isRequired,
            name: PropTypes.string.isRequired,
            description: PropTypes.string.isRequired,
            version: PropTypes.string.isRequired,
            downloadUrl: PropTypes.string,
            homepageUrl: PropTypes.string,
            iconData: PropTypes.string,
            installed: PropTypes.bool.isRequired,
            onConfigure: PropTypes.func.isRequired,
            onInstalled: PropTypes.func.isRequired,
            actions: PropTypes.shape({
                installPluginFromUrl: PropTypes.func.isRequired,
            }).isRequired,
        };

        constructor(props) {
            super(props);

            this.state = {
                installing: false,
                confirmOverwriteInstallModal: false,
                serverError: null,
            };
        }

        onClickOverwriteModal = () => {
            this.setState({confirmOverwriteInstallModal: false});
            return this.installPlugin(true);
        }

        onCancelOverwriteModal = () => {
            this.setState({
                confirmOverwriteInstallModal: false,
                installing: false,
                serverError: null,
            });
        }

        installPlugin = async (force) => {
            const {error} = await this.props.actions.installPluginFromUrl(this.props.downloadUrl, force);

            if (error) {
                if (error.server_error_id === 'app.plugin.install_id.app_error' && !force) {
                    this.setState({confirmOverwriteInstallModal: true});
                    return;
                }

                this.setState({
                    installing: false,
                });

                if (error.server_error_id === 'app.plugin.extract.app_error') {
                    this.setState({serverError: localizeMessage('admin.plugin.error.extract', 'Encountered an error when extracting the plugin.')});
                } else {
                    this.setState({serverError: error.message});
                }
                return;
            }

            this.setState({
                serverError: null,
            });

            this.props.onInstalled();
        }

        onInstall = () => {
            this.setState({installing: true});
            trackEvent('plugins', 'ui_marketplace_download');

            this.installPlugin(false);
        }

        onConfigure = () => {
            trackEvent('plugins', 'ui_marketplace_configure');

            this.props.onConfigure();
        }

        getItemButton() {
            let button = (
                <button
                    onClick={this.onInstall}
                    className='btn btn-primary'
                    disabled={this.state.installing || this.props.downloadUrl === ''}
                >
                    <LoadingWrapper
                        loading={this.state.installing}
                        text={localizeMessage('marketplace_modal.installing', 'Installing...')}
                    >
                        {this.state.serverError ?
                            <FormattedMessage
                                id='marketplace_modal.list.try_again'
                                defaultMessage='Try Again'
                            /> :
                            <FormattedMessage
                                id='marketplace_modal.list.Install'
                                defaultMessage='Install'
                            />
                        }
                    </LoadingWrapper>

                </button>
            );

            if (this.props.installed) {
                button = (
                    <Link
                        to={'/admin_console/plugins/plugin_' + this.props.id}
                    >
                        <button
                            onClick={this.onConfigure}
                            className='btn btn-outline'
                        >
                            <FormattedMessage
                                id='marketplace_modal.list.configure'
                                defaultMessage='Configure'
                            />
                        </button>
                    </Link>);
            }

            return button;
        }

        render() {
            const ariaLabel = `${this.props.name}, ${this.props.description}`.toLowerCase();
            const versionLabel = `(${this.props.version})`;

            let pluginIcon;
            if (this.props.iconData) {
                pluginIcon = (
                    <div className='icon__plugin icon__plugin--background'>
                        <img src={this.props.iconData}/>
                    </div>
                );
            } else {
                pluginIcon = <PluginIcon className='icon__plugin icon__plugin--background'/>;
            }

            let pluginDetails = (
                <>
                    {this.props.name} <span className='light subtitle'>{versionLabel}</span>
                    <p className={classNames('more-modal__description', {error_text: this.state.serverError})}>
                        {this.state.serverError ? this.state.serverError : this.props.description}
                    </p>
                </>
            );

            if (this.props.homepageUrl) {
                pluginDetails = (
                    <a
                        aria-label={ariaLabel}
                        className='style--none more-modal__row--link'
                        target='_blank'
                        rel='noopener noreferrer'
                        href={this.props.homepageUrl}
                    >
                        {pluginDetails}
                    </a>
                );
            } else {
                pluginDetails = (
                    <span
                        aria-label={ariaLabel}
                        className='style--none'
                    >
                        {pluginDetails}
                    </span>
                );
            }

            return (
                <div
                    className={classNames('more-modal__row', 'more-modal__row--link', {item_error: this.state.serverError})}
                    key={this.props.id}
                >
                    {pluginIcon}
                    <div className='more-modal__details'>
                        {pluginDetails}
                    </div>
                    <div className='more-modal__actions'>
                        {this.getItemButton()}
                    </div>
                    <ConfirmModal
                        show={this.state.confirmOverwriteInstallModal}
                        title={
                            <FormattedMessage
                                id='admin.plugin.upload.overwrite_modal.title'
                                defaultMessage='Overwrite existing plugin?'
                            />}
                        message={
                            <FormattedMessage
                                id='admin.plugin.upload.overwrite_modal.desc'
                                defaultMessage='A plugin with this ID already exists. Would you like to overwrite it?'
                            />}
                        confirmButtonClass='btn btn-danger'
                        confirmButtonText={
                            <FormattedMessage
                                id='admin.plugin.upload.overwrite_modal.overwrite'
                                defaultMessage='Overwrite'
                            />}
                        onConfirm={this.onClickOverwriteModal}
                        onCancel={this.onCancelOverwriteModal}
                    />
                </div>
            );
        }
}
