// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';

import * as Utils from 'utils/utils.jsx';
import {t} from 'utils/i18n';
import LoadingWrapper from 'components/widgets/loading/loading_wrapper';
import SuccessIcon from 'components/widgets/icons/fa_success_icon';
import WarningIcon from 'components/widgets/icons/fa_warning_icon';

/**
 * A button which, when clicked, performs an action and displays
 * its outcome as either success, or failure accompanied by the
 * `message` property of the `err` object.
 */
export default class RequestButton extends React.PureComponent {
    static propTypes = {

        /**
         * TD to assign to the form
         */
        id: PropTypes.string,

        /**
         * The action to be called to carry out the request.
         */
        requestAction: PropTypes.func.isRequired,

        /**
         * A component that displays help text for the request button.
         *
         * Typically, this will be a <FormattedMessage/>.
         */
        helpText: PropTypes.element,

        /**
         * A component to be displayed on the button.
         *
         * Typically, this will be a <FormattedMessage/>
         */
        loadingText: PropTypes.string,

        /**
         * A component to be displayed on the button.
         *
         * Typically, this will be a <FormattedMessage/>
         */
        buttonText: PropTypes.element.isRequired,

        /**
         * The element to display as the field label.
         *
         * Typically, this will be a <FormattedMessage/>
         */
        label: PropTypes.element,

        /**
         * True if the button form control should be disabled, otherwise false.
         */
        disabled: PropTypes.bool,

        /**
         * True if the config needs to be saved before running the request, otherwise false.
         *
         * If set to true, the action provided in the `saveConfigAction` property will be
         * called before the action provided in the `requestAction` property, with the later
         * only being called if the former is successful.
         */
        saveNeeded: PropTypes.bool,

        /**
         * Action to be called to save the config, if saveNeeded is set to true.
         */
        saveConfigAction: PropTypes.func,

        /**
         * True if the success message should be show when the request completes successfully,
         * otherwise false.
         */
        showSuccessMessage: PropTypes.bool,

        /**
         * The message to show when the request completes successfully.
         */
        successMessage: PropTypes.shape({

            /**
             * The i18n string ID for the success message.
             */
            id: PropTypes.string.isRequired,

            /**
             * The i18n default value for the success message.
             */
            defaultMessage: PropTypes.string.isRequired,
        }),

        /**
         * The message to show when the request returns an error.
         */
        errorMessage: PropTypes.shape({

            /**
             * The i18n string ID for the error message.
             */
            id: PropTypes.string.isRequired,

            /**
             * The i18n default value for the error message.
             *
             * The placeholder {error} may be used to include the error message returned
             * by the server in response to the failed request.
             */
            defaultMessage: PropTypes.string.isRequired,
        }),

        /**
         * True if the {error} placeholder for the `errorMessage` property should include both
         * the `message` and `detailed_error` properties of the error returned from the server,
         * otherwise false to include only the `message` property.
         */
        includeDetailedError: PropTypes.bool,

        /**
         * An element to display adjacent to the request button.
         */
        alternativeActionElement: PropTypes.element,
    }

    static defaultProps = {
        id: null,
        disabled: false,
        saveNeeded: false,
        showSuccessMessage: true,
        includeDetailedError: false,
        successMessage: {
            id: t('admin.requestButton.requestSuccess'),
            defaultMessage: 'Test Successful',
        },
        errorMessage: {
            id: t('admin.requestButton.requestFailure'),
            defaultMessage: 'Test Failure: {error}',
        },
    }

    constructor(props) {
        super(props);

        this.state = {
            busy: false,
            fail: null,
            success: false,
        };
    }

    handleRequest = (e) => {
        e.preventDefault();

        this.setState({
            busy: true,
            fail: null,
            success: false,
        });

        const doRequest = () => { //eslint-disable-line func-style
            this.props.requestAction(
                () => {
                    this.setState({
                        busy: false,
                        success: true,
                    });
                },
                (err) => {
                    let errMsg = err.message;
                    if (this.props.includeDetailedError && err.detailed_error) {
                        errMsg += ' - ' + err.detailed_error;
                    }

                    this.setState({
                        busy: false,
                        fail: errMsg,
                    });
                },
            );
        };

        if (this.props.saveNeeded) {
            this.props.saveConfigAction(doRequest);
        } else {
            doRequest();
        }
    }

    render() {
        let message = null;
        if (this.state.fail) {
            message = (
                <div>
                    <div className='alert alert-warning'>
                        <WarningIcon/>
                        <FormattedMessage
                            id={this.props.errorMessage.id}
                            defaultMessage={this.props.errorMessage.defaultMessage}
                            values={{
                                error: this.state.fail,
                            }}
                        />
                    </div>
                </div>
            );
        } else if (this.state.success && this.props.showSuccessMessage) {
            message = (
                <div>
                    <div className='alert alert-success'>
                        <SuccessIcon/>
                        <FormattedMessage
                            id={this.props.successMessage.id}
                            defaultMessage={this.props.successMessage.defaultMessage}
                        />
                    </div>
                </div>
            );
        }

        let widgetClassNames = 'col-sm-8';
        let label = null;
        if (this.props.label) {
            label = (
                <label
                    className='control-label col-sm-4'
                >
                    {this.props.label}
                </label>
            );
        } else {
            widgetClassNames = 'col-sm-offset-4 ' + widgetClassNames;
        }

        return (
            <div
                className='form-group'
                id={this.props.id}
            >
                {label}
                <div className={widgetClassNames}>
                    <div>
                        <button
                            type='button'
                            className='btn btn-default'
                            onClick={this.handleRequest}
                            disabled={this.props.disabled}
                        >
                            <LoadingWrapper
                                loading={this.state.busy}
                                text={this.props.loadingText || Utils.localizeMessage('admin.requestButton.loading', ' Loading...')}
                            >
                                {this.props.buttonText}
                            </LoadingWrapper>
                        </button>
                        {this.props.alternativeActionElement}
                        {message}
                    </div>
                    <div className='help-text'>
                        {this.props.helpText}
                    </div>
                </div>
            </div>
        );
    }
}
