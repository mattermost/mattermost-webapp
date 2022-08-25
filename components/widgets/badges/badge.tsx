// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo, ReactNode, HTMLAttributes} from 'react';
import classNames from 'classnames';

import './badge.scss';

export type BadgeVariant = 'info' | 'success' | 'warning' | 'danger';

export type BadgeSize = 'xs' | 'sm' | 'md' | 'lg';

type Props = {
    children: ReactNode;
    icon?: ReactNode;
    show?: boolean;
    size?: BadgeSize;
    uppercase?: boolean;
    variant?: BadgeVariant;
};

type Attrs = HTMLAttributes<HTMLElement>

const Badge = ({
    children,
    icon,
    show = true,
    size = 'xs',
    uppercase = false,
    variant,
    ...attrs
}: Props & Attrs) => {
    if (!show) {
        return null;
    }

    const ButtonOrDiv: keyof JSX.IntrinsicElements = attrs.onClick ? 'button' : 'div';

    return (
        <div className='Badge'>
            <ButtonOrDiv
                {...attrs}
                className={classNames(
                    'Badge__box',
                    attrs.className,
                    {
                        [`${variant}`]: variant,
                        [`Badge--${size}`]: size,
                        'Badge--uppercase': uppercase,
                    },
                )}
            >
                {icon && (
                    <span className='Badge__icon'>{icon}</span>
                )}
                {children}
            </ButtonOrDiv>
        </div>
    );
};

export default memo(Badge);
