// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo, ReactNode, HTMLAttributes} from 'react';
import classNames from 'classnames';

import './badge.scss';

export type BadgeVariant = 'info' | 'success' | 'warning' | 'danger';

type Props = {
    show?: boolean;
    variant?: BadgeVariant;
    children: ReactNode;
};

type Attrs = HTMLAttributes<HTMLElement>

const Badge = ({
    show = true,
    children,
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
                className={classNames('Badge__box', attrs.className, {[`${variant}`]: variant})}
            >
                {children}
            </ButtonOrDiv>
        </div>
    );
};

export default memo(Badge);
