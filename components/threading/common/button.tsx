// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {FC, memo, ButtonHTMLAttributes, ReactNode} from 'react';
import classNames from 'classnames';

import './button.scss';

type Attrs = Exclude<ButtonHTMLAttributes<HTMLButtonElement>, Props>

type Props = {
    prepend?: ReactNode,
    append?: ReactNode,
    isActive?: boolean,
    hasDot?: boolean,
}

const Button: FC<Props & Attrs> = ({
    prepend,
    append,
    children,
    isActive,
    hasDot,
    ...attrs
}) => (
    <button
        {...attrs}
        className={classNames('Button Button___transparent', {'is-active': isActive}, attrs.className)}
    >
        {prepend && (
            <span className='Button_prepended'>
                {prepend}
            </span>
        )}
        <span className='Button_label'>
            {children}
            {hasDot && <span className='dot'/>}
        </span>
        {append && (
            <span className='Button_appended'>
                {append}
            </span>
        )}
    </button>
);

export default memo(Button);
