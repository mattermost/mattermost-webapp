// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React, {PureComponent} from 'react';

import SetByEnv from './set_by_env';

export default class Settings extends PureComponent {
    static propTypes = {
        inputId: PropTypes.string,
        label: PropTypes.node.isRequired,
        children: PropTypes.node.isRequired,
        helpText: PropTypes.node,
        setByEnv: PropTypes.bool,
    };

    render() {
        const {
            children,
            setByEnv,
            helpText,
            inputId,
            label,
        } = this.props;

        return (
            <div className='form-group'>
                <label
                    className='control-label col-sm-4'
                    htmlFor={inputId}
                >
                    {label}
                </label>
                <div className='col-sm-8'>
                    {children}
                    <div className='help-text'>
                        {helpText}
                    </div>
                    {setByEnv ? <SetByEnv/> : null}
                </div>
            </div>
        );
    }
}
