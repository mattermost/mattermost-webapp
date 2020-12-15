// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {FormattedMessage} from 'react-intl';

import {ActionFunc} from 'mattermost-redux/types/actions';

import {AdminConfig} from 'mattermost-redux/types/config';

import {BaseProps} from 'components/admin_console/admin_settings';

import {browserHistory} from 'utils/browser_history';
import {Constants} from 'utils/constants';

import FormError from 'components/form_error';

import imagePath from 'images/openid-convert/emoticon-outline.svg';

import './openid_convert.scss';

type Props = BaseProps & {
    disabled?: boolean;
    actions: {
        updateConfig: (config: AdminConfig) => ActionFunc & Partial<{error?: ClientErrorPlaceholder}>;
    };
};
type State = {
    serverError?: string;
}

type ClientErrorPlaceholder = {
    message: string;
    server_error_id: string;
}

export default class OpenIdConvert extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            serverError: undefined,
        };
    }

    upgradeConfig = async (e: React.MouseEvent) => {
        e.preventDefault();

        const newConfig = JSON.parse(JSON.stringify(this.props.config));

        if (newConfig.Office365Settings.DirectoryId) {
            newConfig.Office365Settings.DiscoveryEndpoint = 'https://login.microsoftonline.com/' + newConfig.Office365Settings.DirectoryId + '/v2.0/.well-known/openid-configuration';
        }
        newConfig.GoogleSettings.DiscoveryEndpoint = 'https://accounts.google.com/.well-known/openid-configuration';

        if (newConfig.GitLabSettings.UserApiEndpoint) {
            const url = newConfig.GitLabSettings.UserApiEndpoint.replace('/api/v4/user', '');
            newConfig.GitLabSettings.DiscoveryEndpoint = url + '/.well-known/openid-configuration';
        }

        ['Office365Settings', 'GoogleSettings', 'GitLabSettings'].forEach((setting) => {
            newConfig[setting].Scope = Constants.OPENID_SCOPES;
            newConfig[setting].UserApiEndpoint = '';
            newConfig[setting].AuthEndpoint = '';
            newConfig[setting].TokenEndpoint = '';
        });

        const {error: err} = await this.props.actions.updateConfig(newConfig);
        if (err) {
            this.setState({serverError: err.message});
        } else {
            browserHistory.push('/admin_console/authentication/openid');
        }
    }

    render() {
        return (
            <div className='OpenIdConvert'>
                <div className='OpenIdConvert_imageWrapper'>
                    <img
                        className='OpenIdConvert_image'
                        src={imagePath}
                        alt='OpenId Convert Image'
                    />
                </div>

                <div className='OpenIdConvert_copyWrapper'>
                    <div className='OpenIdConvert__heading'>
                        <FormattedMessage
                            id='admin.openIdConvert.heading'
                            defaultMessage='OAuth 2.0 is being deprecated and replace by OpenID Connect.'
                        />
                    </div>
                    <p>
                        <FormattedMessage
                            id='admin.openIdConvert.message'
                            defaultMessage='Convert your OAuth 2.0 configuration to the new OpenID Connect standard.'
                        />
                    </p>
                    <div className='OpenIdConvert_actionWrapper'>
                        <button
                            className='btn'
                            data-testid='openIdConvert'
                            disabled={this.props.disabled}
                            onClick={this.upgradeConfig}
                        >
                            <FormattedMessage
                                id='admin.openIdConvert.text'
                                defaultMessage='Convert to OpenID Connect'
                            />
                        </button>
                        <a
                            className='btn-secondary'
                            href='https://docs.mattermost.com/deployment/sso-gitlab.html'
                            data-testid='openIdLearnMore'
                            target='_blank'
                            rel='noopener noreferrer'
                        >
                            <FormattedMessage
                                id='admin.openIdConvert.help'
                                defaultMessage='Learn more'
                            />
                        </a>
                        <div
                            className='error-message'
                            data-testid='errorMessage'
                        >
                            <FormError error={this.state.serverError}/>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
