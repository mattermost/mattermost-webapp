// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import classNames from 'classnames';

interface Props {
    children: React.ReactNode;
    size: string;
    wrap?: boolean;
    onMouseOver?: () => void;
}

const Label: React.FC<Props> = ({children, size, wrap, onMouseOver}: Props) => {
    return (
        <span
            className={classNames([`Label Label___${size}`, {Label___wrap: wrap}])}
            onMouseOver={onMouseOver}
        >
            {children}
        </span>
    );
};

export default Label;