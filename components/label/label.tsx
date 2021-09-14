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
}

type Props = {
    type: LabelType;
    children: React.ReactNode;
}

function Label({type, children}: Props) {
    return (
        <BSLabel bsStyle={type}>
            {children}
        </BSLabel>
    );
}

export default Label;
