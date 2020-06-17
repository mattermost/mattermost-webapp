// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import classNames from 'classnames';

interface Props {
    leftIconGlyph?: string;
    rightIconGlyph?: string;
    style: string;
    size: string;
    label: string;
    link?: string;
    fullWidth?: boolean;
    disabled?: boolean;
}

const ButtonCommon: React.FC<Props> = ({leftIconGlyph, rightIconGlyph, style, size, label, link, fullWidth, disabled}: Props) => {
    const anchorTag = (
        <a
            href={link}
            className={classNames([`Button Button___${style} Button___${size}`, {fullWidth}])}
            tabIndex={-1}
            aria-label='button'
        >
            {/* TODO: Replace with Icon and Label */}
            {leftIconGlyph && <i className='Icon Icon___small icon-emoticon-happy-outline Button_icon'/>}
            <span className='Label Label___standard Button_label'>{label}</span>
            {rightIconGlyph && <i className='Icon Icon___small icon-emoticon-happy-outline Button_icon'/>}
        </a>);

    const buttonTag = (
        <button
            className={classNames([`Button Button___${style} Button___${size}`, {fullWidth}])}
            disabled={disabled}
            tabIndex={-1}
            aria-label='button'
        >
            {leftIconGlyph && <i className='Icon Icon___small icon-emoticon-happy-outline Button_icon'/>}
            <span className='Label Label___standard Button_label'>{label}</span>
            {rightIconGlyph && <i className='Icon Icon___small icon-emoticon-happy-outline Button_icon'/>}
        </button>
    );

    return (
        <div
            className='Button__wrapper'
        >
            {link ? anchorTag : buttonTag}
        </div>
    );
};

export default ButtonCommon;
