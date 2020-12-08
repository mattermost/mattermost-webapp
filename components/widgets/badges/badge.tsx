// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo, ReactNode, HTMLAttributes} from 'react';

import './badge.scss';

type Props = {
    show?: boolean;
    children: ReactNode;
};

type Attrs = HTMLAttributes<HTMLElement>

const Badge = ({
    show = true,
    children,
    className,
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
                className={'Badge__box ' + className}
            >
                {children}
            </ButtonOrDiv>
        </div>
    );
};

export default memo(Badge);
