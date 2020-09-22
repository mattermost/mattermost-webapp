// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {FC, memo, ButtonHTMLAttributes, ReactNode} from 'react';
import classNames from 'classnames';

import './button.scss';

type Attrs = Exclude<ButtonHTMLAttributes<HTMLButtonElement>, Props>

type Props = {
    iconLeft?: ReactNode,
    iconRight?: ReactNode,
    isActive?: boolean,
    hasDot?: boolean,
}

const Comp: FC<Props & Attrs> = ({
    iconLeft,
    iconRight,
    children,
    isActive,
    hasDot,
    ...attrs
}) => (
    <button
        {...attrs}
        className={classNames('Button Button___transparent', {'is-active': isActive})}
    >
        {iconLeft && (
            <span className='Icon Button_iconLeft'>
                {iconLeft}
            </span>
        )}
        <span className='Button_label'>
            {children}
            {hasDot && <span className='dot'/>}
        </span>
        {iconRight && (
            <span className='Icon Button_iconRight'>
                {iconRight}
            </span>
        )}
    </button>
);

export default memo(Comp);
