// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {Label as BSLabel} from 'react-bootstrap';

import './label.scss';

export enum LabelType {
    Success = 'success',
    Warning = 'warning',
    Danger = 'danger',
    Info = 'info',
    Default = 'default',
    Primary = 'primary',
    PrimaryFaded = 'primary-faded',
}

type Props = {
    type: LabelType;
    children: React.ReactNode;
    icon?: React.ReactNode;
}

function Label({type, children, icon}: Props) {
    return (
        <BSLabel bsStyle={type}>
            {icon && (
                <span className='label__icon'>{icon}</span>
            )}
            {children}
        </BSLabel>
    );
}

export default Label;
