// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

export default class FormError extends React.Component {
    static get propTypes() {
        // accepts either a single error or an array of errors
        return {
            type: PropTypes.node,
            error: PropTypes.node,
            textClassName: PropTypes.string,
            iconClassName: PropTypes.string,
            margin: PropTypes.bool,
            errors: PropTypes.arrayOf(PropTypes.node),
        };
    }

    static get defaultProps() {
        return {
            error: null,
            errors: [],
        };
    }

    render() {
        if (!this.props.error && this.props.errors.length === 0) {
            return null;
        }

        // look for the first truthy error to display
        let message = this.props.error;

        if (!message) {
            for (const error of this.props.errors) {
                if (error) {
                    message = error;
                }
            }
        }

        if (!message) {
            return null;
        }

        if (this.props.type === 'modal') {
            return (
                <div className='form-group'>
                    <label className='col-sm-12 has-error'>
                        {message}
                    </label>
                </div>
            );
        }

        if (this.props.type === 'backstage') {
            return (
                <div className='pull-left has-error'>
                    <label className='control-label'>
                        {message}
                    </label>
                </div>
            );
        }

        if (this.props.margin) {
            return (
                <div className='form-group has-error'>
                    <label className='control-label'>
                        {message}
                    </label>
                </div>
            );
        }

        return (
            <div className={`col-sm-12 ${this.props.textClassName || 'has-error'}`}>
                <label className='control-label'>
                    <i className={`fa ${this.props.iconClassName || 'fa-exclamation-circle'}`}/> {message}
                </label>
            </div>
        );
    }
}
