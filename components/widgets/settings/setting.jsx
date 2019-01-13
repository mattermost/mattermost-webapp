// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
// @flow

import * as React from 'react';

type Props = {|
    inputId?: string,
    label: React.Node,
    labelClassName?: string,
    inputClassName?: string,
    children: React.Node,
    helpText?: React.Node,
    footer?: React.Node,
|}

const Setting = (props: Props) => {
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
                className={'control-label ' + (labelClassName || '')}
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
