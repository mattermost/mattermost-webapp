// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
// @flow

import * as React from 'react';

type Props = {|
    type?: 'modal' | 'backstage',
    error?: React.Node,
    margin?: boolean,
    errors?: Array<React.Node>,
|}

export default class FormError extends React.Component<Props> {
    static defaultProps = {
        error: null,
        errors: [],
    }

    render() {
        const {type, error, margin, errors} = this.props;
        if (!error && (!errors || errors.length === 0)) {
            return null;
        }

        // look for the first truthy error to display
        let message = error;

        if (!message) {
            for (const e of errors || []) {
                if (e) {
                    message = e;
                }
            }
        }

        if (!message) {
            return null;
        }

        if (type === 'modal') {
            return (
                <div className='form-group'>
                    <label className='col-sm-12 has-error'>
                        {message}
                    </label>
                </div>
            );
        }

        if (type === 'backstage') {
            return (
                <div className='pull-left has-error'>
                    <label className='control-label'>
                        {message}
                    </label>
                </div>
            );
        }

        if (margin) {
            return (
                <div className='form-group has-error'>
                    <label className='control-label'>
                        {message}
                    </label>
                </div>
            );
        }

        return (
            <div className='col-sm-12 has-error'>
                <label className='control-label'>
                    <i className='fa fa-exclamation-circle'/> {message}
                </label>
            </div>
        );
    }
}
