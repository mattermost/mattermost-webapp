// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';

import {FormattedMessage} from 'react-intl';
import {Link} from 'react-router-dom';

import LoadingWrapper from 'components/widgets/loading/loading_wrapper.jsx';
import ConfirmModal from 'components/confirm_modal.jsx';
import PluginIcon from 'components/svg/plugin_icon.jsx';

import {localizeMessage} from 'utils/utils';
import {MarketplaceItemStates} from 'utils/constants';

export default class MarketplaceItem extends React.Component {
        static propTypes = {
            id: PropTypes.string.isRequired,
            name: PropTypes.string.isRequired,
            description: PropTypes.string.isRequired,
            version: PropTypes.string.isRequired,
            isPrepackaged: PropTypes.bool.isRequired,
            itemUrl: PropTypes.string,
            itemState: PropTypes.string.isRequired,
            onConfigure: PropTypes.func.isRequired,
            actions: PropTypes.shape({
                installPluginFromUrl: PropTypes.func.isRequired,
            }).isRequired,
        };

        constructor(props) {
            super(props);

            this.state = {
                itemState: this.props.itemState,
                downloading: false,
                confirmOverwriteInstallModal: false,
                serverError: null,
            };
        }

        onClickOvewriteModal = () => {
            this.setState({confirmOverwriteInstallModal: false});
            return this.installPlugin(true);
        }

        onCancelOvewriteModal = () => {
            this.setState({
                confirmOverwriteInstallModal: false,
                downloading: false,
                serverError: null,
            });
        }

        installPlugin = async (force) => {
            const {error} = await this.props.actions.installPluginFromUrl(this.props.itemUrl, force);

            if (error) {
                if (error.server_error_id === 'app.plugin.install_id.app_error' && !force) {
                    this.setState({confirmOverwriteInstallModal: true});
                    return;
                }

                this.setState({
                    downloading: false,
                });

                if (error.server_error_id === 'app.plugin.extract.app_error') {
                    this.setState({serverError: localizeMessage('admin.plugin.error.extract', 'Encountered an error when extracting the plugin.')});
                } else {
                    this.setState({serverError: error.message});
                }
                return;
            }

            this.setState({
                itemState: MarketplaceItemStates.CONFIGURE,
                serverError: null,
            });
        }

        onDownload = () => {
            this.setState({downloading: true});

            this.installPlugin(false);
        }

        render() {
            const ariaLabel = `${this.props.name}, ${this.props.description}`.toLowerCase();
            const versionLabel = `(${this.props.version}${this.props.isPrepackaged ? ', pre-packaged)' : ')'}`;

            let button = null;

            switch (this.state.itemState) {
            case MarketplaceItemStates.DOWNLOAD:
                button = (
                    <button
                        onClick={this.onDownload}
                        className='btn btn-primary'
                        disabled={this.state.downloading}
                    >
                        <LoadingWrapper
                            loading={this.state.downloading}
                            text={localizeMessage('marketplace_modal.downloading', 'Downloading...')}
                        >
                            {this.state.serverError ?
                                <FormattedMessage
                                    id='marketplace_modal.list.try_again'
                                    defaultMessage='Try Again'
                                /> :
                                <FormattedMessage
                                    id='marketplace_modal.list.download'
                                    defaultMessage='Download'
                                />
                            }
                        </LoadingWrapper>

                    </button>);
                break;
            case MarketplaceItemStates.CONFIGURE:
                button = (
                    <Link
                        to={'/admin_console/plugins/plugin_' + this.props.id}
                    >
                        <button
                            onClick={this.props.onConfigure}
                            className='btn btn-outline'
                        >
                            <FormattedMessage
                                id='marketplace_modal.list.configure'
                                defaultMessage='Configure'
                            />
                        </button>
                    </Link>);
                break;
            }

            return (
                <div
                    className={'more-modal__row' + (this.state.serverError ? ' item_error' : '')}
                    key={this.props.id}
                >
                    <PluginIcon className='icon__plugin'/>
                    <div className='more-modal__details'>
                        <button
                            href={this.props.itemUrl}
                            target='_blank'
                            aria-label={ariaLabel}
                            className='style--none more-modal__name'
                        >
                            {this.props.name} <span className='light subtitle'>{versionLabel}</span>
                        </button>
                        <p className={'more-modal__description' + (this.state.serverError ? ' error_text' : '')}>
                            { this.state.serverError ? this.state.serverError : this.props.description}
                        </p>
                    </div>
                    <div className='more-modal__actions'>
                        {button}
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
                        onConfirm={this.onClickOvewriteModal}
                        onCancel={this.onCancelOvewriteModal}
                    />
                </div>
            );
        }
}
