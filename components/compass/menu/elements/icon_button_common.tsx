// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import classNames from 'classnames';

interface Props {
    iconGlyph: string;
    size: string;
    label: string;
    disabled?: boolean;
    additionalClass?: string;
}

const IconButtonCommon: React.FC<Props> = ({iconGlyph, size, label, disabled, additionalClass}: Props) => {
    return (
        <div
            className='IconButton__wrapper'
        >
            <button
                className={classNames([`IconButton IconButton___${size}`, {additionalClass}])}
                disabled={disabled}
                tabIndex={-1}
                aria-label={label}
            >
                {/* TODO: replace with IconCommon component */}
                <i className={`Icon Icon___standard icon-${iconGlyph} Icon___standard IconButton_icon`}/>
            </button>
        </div>
    );
};

export default IconButtonCommon;