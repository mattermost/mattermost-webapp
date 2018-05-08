// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import $ from 'jquery';
import PropTypes from 'prop-types';
import React from 'react';
import ReactDOM from 'react-dom';
import {FormattedMessage} from 'react-intl';

export default class SettingsUpload extends React.Component {
    constructor(props) {
        super(props);

        this.doFileSelect = this.doFileSelect.bind(this);
        this.doSubmit = this.doSubmit.bind(this);

        this.state = {
            clientError: this.props.clientError,
            serverError: this.props.serverError,
            filename: '',
        };
    }

    componentWillReceiveProps() {
        this.setState({
            clientError: this.props.clientError,
            serverError: this.props.serverError,
        });
    }

    doFileSelect(e) {
        e.preventDefault();
        var filename = $(e.target).val();
        if (filename.substring(3, 11) === 'fakepath') {
            filename = filename.substring(12);
        }
        this.setState({
            clientError: '',
            serverError: '',
            filename,
        });
    }

    doSubmit(e) {
        e.preventDefault();
        var inputnode = ReactDOM.findDOMNode(this.refs.uploadinput);
        if (inputnode.files && inputnode.files[0]) {
            this.props.submit(inputnode.files[0]);
        } else {
            this.setState({clientError: true});
        }
    }

    render() {
        let clientError = null;
        if (this.state.clientError) {
            clientError = (
                <div className='file-status'>
                    <FormattedMessage
                        id='setting_upload.noFile'
                        defaultMessage='No file selected.'
                    />
                </div>
            );
        }
        let serverError = null;
        if (this.state.serverError) {
            serverError = (
                <div className='file-status'>{this.state.serverError}</div>
            );
        }
        let fileNameText = null;
        let submitButtonClass = 'btn btn-sm btn-primary disabled';
        if (this.state.filename) {
            fileNameText = (
                <div className='file-status file-name'>{this.state.filename}</div>
            );
            submitButtonClass = 'btn btn-sm btn-primary';
        }

        return (
            <ul className='section-max'>
                <li className='col-sm-12 section-title'>{this.props.title}</li>
                <li className='col-sm-offset-3 col-sm-9'>{this.props.helpText}</li>
                <li className='col-sm-offset-3 col-sm-9'>
                    <ul className='setting-list'>
                        <li className='setting-list-item'>
                            <span className='btn btn-sm btn-primary btn-file sel-btn'>
                                <FormattedMessage
                                    id='setting_upload.select'
                                    defaultMessage='Select file'
                                />
                                <input
                                    ref='uploadinput'
                                    accept={this.props.fileTypesAccepted}
                                    type='file'
                                    onChange={this.doFileSelect}
                                />
                            </span>
                            <a
                                className={submitButtonClass}
                                onClick={this.doSubmit}
                            >
                                <FormattedMessage
                                    id='setting_upload.import'
                                    defaultMessage='Import'
                                />
                            </a>
                            {fileNameText}
                            {serverError}
                            {clientError}
                        </li>
                    </ul>
                </li>
            </ul>
        );
    }
}

SettingsUpload.propTypes = {
    title: PropTypes.string.isRequired,
    submit: PropTypes.func.isRequired,
    fileTypesAccepted: PropTypes.string.isRequired,
    clientError: PropTypes.string,
    serverError: PropTypes.string,
    helpText: PropTypes.object,
};
