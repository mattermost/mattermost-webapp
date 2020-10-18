// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';
import PropTypes from 'prop-types';

import * as Utils from 'utils/utils.jsx';
import {t} from 'utils/i18n.jsx';

import FormattedMarkdownMessage from 'components/formatted_markdown_message.jsx';
import LocalizedInput from 'components/localized_input/localized_input';

export default class Setup extends React.PureComponent {
    static propTypes = {
        currentUser: PropTypes.object,
        siteName: PropTypes.string,
        enforceMultifactorAuthentication: PropTypes.bool.isRequired,
        actions: PropTypes.shape({
            activateMfa: PropTypes.func.isRequired,
            generateMfaSecret: PropTypes.func.isRequired,
        }).isRequired,
    }

    constructor(props) {
        super(props);

        this.state = {secret: '', qrCode: ''};

        this.input = React.createRef();
    }

    componentDidMount() {
        const user = this.props.currentUser;
        if (!user || user.mfa_active) {
            this.props.history.push('/');
            return;
        }

        this.props.actions.generateMfaSecret().then(({data, error}) => {
            if (error) {
                this.setState({
                    serverError: error.message,
                });
                return;
            }

            this.setState({
                secret: data.secret,
                qrCode: data.qr_code,
            });
        });
    }

    submit = (e) => {
        e.preventDefault();
        const code = this.input.current.value.replace(/\s/g, '');
        if (!code || code.length === 0) {
            this.setState({error: Utils.localizeMessage('mfa.setup.codeError', 'Please enter the code from Google Authenticator.')});
            return;
        }

        this.setState({error: null});

        this.props.actions.activateMfa(code).then(({error}) => {
            if (error) {
                if (error.server_error_id === 'ent.mfa.activate.authenticate.app_error') {
                    this.setState({
                        error: Utils.localizeMessage('mfa.setup.badCode', 'Invalid code. If this issue persists, contact your System Administrator.'),
                    });
                } else {
                    this.setState({
                        error: error.message,
                    });
                }

                return;
            }

            this.props.history.push('/mfa/confirm');
        });
    }

    render() {
        let formClass = 'form-group';
        let errorContent;
        if (this.state.error) {
            errorContent = <div className='form-group has-error'><label className='control-label'>{this.state.error}</label></div>;
            formClass += ' has-error';
        }

        let mfaRequired;
        if (this.props.enforceMultifactorAuthentication) {
            mfaRequired = (
                <p>
                    <FormattedMarkdownMessage
                        id='mfa.setup.required'
                        defaultMessage='**Multi-factor authentication is required on {siteName}.**'
                        values={{
                            siteName: this.props.siteName,
                        }}
                    />
                </p>
            );
        }

        return (
            <div>
                <form
                    onSubmit={this.submit}
                    className={formClass}
                >
                    {mfaRequired}
                    <p>
                        <FormattedMarkdownMessage
                            id='mfa.setup.step1'
                            defaultMessage="**Step 1: **On your phone, download Google Authenticator from [iTunes](!https://itunes.apple.com/us/app/google-authenticator/id388497605?mt=8') or [Google Play](!https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2&hl=en)"
                        />
                    </p>
                    <p>
                        <FormattedMarkdownMessage
                            id='mfa.setup.step2'
                            defaultMessage='**Step 2: **Use Google Authenticator to scan this QR code, or manually type in the secret key'
                        />
                    </p>
                    <div className='form-group'>
                        <div className='col-sm-12'>
                            <img
                                alt={'qr code image'}
                                style={style.qrCode}
                                src={'data:image/png;base64,' + this.state.qrCode}
                            />
                        </div>
                    </div>
                    <br/>
                    <div className='form-group'>
                        <p className='col-sm-12'>
                            <FormattedMessage
                                id='mfa.setup.secret'
                                defaultMessage='Secret: {secret}'
                                values={{
                                    secret: this.state.secret,
                                }}
                            />
                        </p>
                    </div>
                    <p>
                        <FormattedMarkdownMessage
                            id='mfa.setup.step3'
                            defaultMessage='**Step 3: **Enter the code generated by Google Authenticator'
                        />
                    </p>
                    <p>
                        <LocalizedInput
                            ref={this.input}
                            className='form-control'
                            placeholder={{id: t('mfa.setup.code'), defaultMessage: 'MFA Code'}}
                            autoFocus={true}
                        />
                    </p>
                    {errorContent}
                    <button
                        type='submit'
                        className='btn btn-primary'
                    >
                        <FormattedMessage
                            id='mfa.setup.save'
                            defaultMessage='Save'
                        />
                    </button>
                </form>
            </div>
        );
    }
}

const style = {
    qrCode: {maxHeight: 170},
};
