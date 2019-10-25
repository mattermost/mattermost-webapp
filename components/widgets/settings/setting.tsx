// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

interface SettingsPropsInterface {
    inputId?: string;
    label: React.ReactNode;
    labelClassName?: string;
    inputClassName?: string;
    children: React.ReactNode;
    helpText?: React.ReactNode;
    footer?: React.ReactNode;
}

const Setting: React.FunctionComponent<SettingsPropsInterface> = ({
    inputId,
    label,
    labelClassName,
    inputClassName,
    children,
    footer,
    helpText,
}) => {
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

export default Setting;