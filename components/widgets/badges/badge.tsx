// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo, ReactNode, HTMLAttributes} from 'react';

import './badge.scss';

type Props = {
    show?: boolean;
    children: ReactNode;
};

type Attrs = HTMLAttributes<HTMLDivElement>

const Badge = ({
    show = true,
    children,
    className,
    ...attrs
}: Props & Attrs) => {
    if (!show) {
        return null;
    }
    return (
        <div className='Badge'>
            <div
                {...attrs}
                aria-role={attrs.onClick ? 'button' : undefined}
                className={'Badge__box ' + className}
            >
                {children}
            </div>
        </div>
    );
};

export default memo(Badge);
