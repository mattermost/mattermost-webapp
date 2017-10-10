// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import {saveConfig} from 'actions/admin_actions.jsx';

import SaveButton from 'components/save_button.jsx';
import FormError from 'components/form_error.jsx';

export default class AdminSettings extends React.Component {
    static propTypes = {

        /*
         * Object representing the config file
         */
        config: PropTypes.object
    }

    constructor(props) {
        super(props);

        this.state = Object.assign(this.getStateFromConfig(props.config), {
            saveNeeded: false,
            saving: false,
            serverError: null
        });
    }

    handleChange = (id, value) => {
        this.setState({
            saveNeeded: true,
            [id]: value
        });
    }

    handleSubmit = (e) => {
        e.preventDefault();

        this.doSubmit();
    }

    doSubmit = (callback) => {
        this.setState({
            saving: true,
            serverError: null
        });

        // clone config so that we aren't modifying data in the stores
        let config = JSON.parse(JSON.stringify(this.props.config));
        config = this.getConfigFromState(config);

        saveConfig(
            config,
            (savedConfig) => {
                this.setState(this.getStateFromConfig(savedConfig));

                this.setState({
                    saveNeeded: false,
                    saving: false
                });

                if (callback) {
                    callback();
                }

                if (this.handleSaved) {
                    this.handleSaved(config);
                }
            },
            (err) => {
                this.setState({
                    saving: false,
                    serverError: err.message
                });

                if (callback) {
                    callback();
                }

                if (this.handleSaved) {
                    this.handleSaved(config);
                }
            }
        );
    }

    parseInt(str, defaultValue) {
        const n = parseInt(str, 10);

        if (isNaN(n)) {
            if (defaultValue) {
                return defaultValue;
            }
            return 0;
        }

        return n;
    }

    parseIntNonZero(str, defaultValue) {
        const n = parseInt(str, 10);

        if (isNaN(n) || n < 1) {
            if (defaultValue) {
                return defaultValue;
            }
            return 1;
        }

        return n;
    }

    render() {
        return (
            <div className='wrapper--fixed'>
                <h3 className='admin-console-header'>
                    {this.renderTitle()}
                </h3>
                <form
                    className='form-horizontal'
                    role='form'
                    onSubmit={this.handleSubmit}
                >
                    {this.renderSettings()}
                    <div className='form-group'>
                        <FormError error={this.state.serverError}/>
                    </div>
                    <div className='form-group'>
                        <div className='col-sm-12'>
                            <SaveButton
                                saving={this.state.saving}
                                disabled={!this.state.saveNeeded || (this.canSave && !this.canSave())}
                                onClick={this.handleSubmit}
                                savingMessageId='admin.saving'
                                defaultMessage='Saving'
                            />
                        </div>
                    </div>
                </form>
            </div>
        );
    }
}
