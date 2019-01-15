// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';

const Setting = (props) => {
    const {
        children,
        footer,
        helpText,
        inputId,
        label,
        labelClassName,
        inputClassName,
    } = props;

    return (
        <div className='form-group'>
            <label
                className={'control-label ' + labelClassName}
                htmlFor={inputId}
            >
                {label}
            </label>
            <div className={inputClassName}>
                {children}
                <div className='help-text'>
                    {helpText}
                </div>
                {footer}
            </div>
        </div>
    );
};

Setting.propTypes = {
    inputId: PropTypes.string,
    label: PropTypes.node.isRequired,
    labelClassName: PropTypes.string,
    inputClassName: PropTypes.string,
    children: PropTypes.node.isRequired,
    helpText: PropTypes.node,
    footer: PropTypes.node,
};

export default Setting;