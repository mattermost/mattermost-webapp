// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import classNames from 'classnames';

import './external_login_button.scss';

export type ExternalLoginButtonType = {
    id: string;
    url: string;
    icon: React.ReactNode;
    label: string;
    style?: React.CSSProperties;
    direction?: 'row' | 'column';
};

const ExternalLoginButton = ({
    id,
    url,
    icon,
    label,
    style,
    direction = 'row',
}: ExternalLoginButtonType) => (
    <a
        id={id}
        className={classNames('external-login-button', {'direction-column': direction === 'column'}, id)}
        href={url}
        style={style}
    >
        {icon}
        <span className='external-login-button-label'>
            {label}
        </span>
    </a>
);

export default ExternalLoginButton;
