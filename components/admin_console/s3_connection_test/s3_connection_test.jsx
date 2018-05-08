// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';

import * as Utils from 'utils/utils.jsx';

export default class S3ConnectionTestButton extends React.Component {
    static get propTypes() {
        return {
            config: PropTypes.object.isRequired,
            getConfigFromState: PropTypes.func.isRequired,
            disabled: PropTypes.bool.isRequired,
            actions: PropTypes.shape({
                testS3Connection: PropTypes.func.isRequired,
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

        this.props.actions.testS3Connection(config).then(
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
                    <i className='fa fa-check'/>
                    <FormattedMessage
                        id='admin.s3.s3Success'
                        defaultMessage='Connection was successful'
                    />
                </div>
            );
        } else if (this.state.fail) {
            testMessage = (
                <div className='alert alert-warning'>
                    <i className='fa fa-warning'/>
                    <FormattedMessage
                        id='admin.s3.s3Fail'
                        defaultMessage='Connection unsuccessful: {error}'
                        values={{
                            error: this.state.fail,
                        }}
                    />
                </div>
            );
        }

        let contents = null;
        if (this.state.testing) {
            contents = (
                <span>
                    <span className='fa fa-refresh icon--rotate'/>
                    {Utils.localizeMessage('admin.s3.testing', 'Testing...')}
                </span>
            );
        } else {
            contents = (
                <FormattedMessage
                    id='admin.s3.connectionS3Test'
                    defaultMessage='Test Connection'
                />
            );
        }

        return (
            <div className='form-group s3-connection-test'>
                <div className='col-sm-offset-4 col-sm-8'>
                    <div className='help-text'>
                        <button
                            className='btn btn-default'
                            onClick={this.handleTestConnection}
                            disabled={this.props.disabled}
                        >
                            {contents}
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
