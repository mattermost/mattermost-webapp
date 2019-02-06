// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';

import LoadingWrapper from 'components/widgets/loading/loading_wrapper.jsx';

import * as Utils from 'utils/utils.jsx';
import SuccessIcon from 'components/icon/success_icon';
import WarningIcon from 'components/icon/warning_icon';

export default class EmailConnectionTestButton extends React.Component {
    static get propTypes() {
        return {
            config: PropTypes.object.isRequired,
            getConfigFromState: PropTypes.func.isRequired,
            disabled: PropTypes.bool.isRequired,
            actions: PropTypes.shape({
                testEmail: PropTypes.func.isRequired,
            }).isRequired,
        };
    }

    constructor(props) {
        super(props);

        this.state = {
            testing: false,
            success: false,
            fail: null,
        };
    }

    handleTestConnection = (e) => {
        e.preventDefault();

        this.setState({
            testing: true,
            success: false,
            fail: null,
        });

        const config = JSON.parse(JSON.stringify(this.props.config));
        this.props.getConfigFromState(config);

        this.props.actions.testEmail(config).then(
            (data) => {
                if (data.error) {
                    let fail = data.error.message;
                    if (data.error.detailed_error) {
                        fail += ' - ' + data.error.detailed_error;
                    }
                    this.setState({
                        testing: false,
                        fail,
                    });
                } else {
                    this.setState({
                        testing: false,
                        success: true,
                    });
                }
            }
        );
    }

    render() {
        let testMessage = null;
        if (this.state.success) {
            testMessage = (
                <div className='alert alert-success'>
                    <SuccessIcon/>
                    <FormattedMessage
                        id='admin.email.emailSuccess'
                        defaultMessage='No errors were reported while sending an email.  Please check your inbox to make sure.'
                    />
                </div>
            );
        } else if (this.state.fail) {
            testMessage = (
                <div className='alert alert-warning'>
                    <WarningIcon/>
                    {this.state.fail}
                </div>
            );
        }

        return (
            <div className='form-group email-connection-test'>
                <div className='col-sm-offset-4 col-sm-8'>
                    <div className='help-text'>
                        <button
                            className='btn btn-default'
                            onClick={this.handleTestConnection}
                            disabled={this.props.disabled}
                        >
                            <LoadingWrapper
                                loading={this.state.testing}
                                text={Utils.localizeMessage('admin.email.testing', 'Testing...')}
                            >
                                <FormattedMessage
                                    id='admin.email.connectionSecurityTest'
                                    defaultMessage='Test Connection'
                                />
                            </LoadingWrapper>
                        </button>
                        <div>
                            {testMessage}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
