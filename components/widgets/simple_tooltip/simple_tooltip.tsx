// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo, ReactNode, ComponentProps, useState} from 'react';
import {Tooltip} from 'react-bootstrap';

import OverlayTrigger from 'components/overlay_trigger';

type Props = {
    id: string;
    content: ReactNode;
    children: ReactNode;
    className?: string;
    arrowOffsetTop?: number | string;
}

const SimpleTooltip = ({
    id,
    content,
    children,
    placement = 'top',
    className = 'hidden-xs',
    delayShow = 500,
    arrowOffsetTop,
    ...props
}: Props & Omit<ComponentProps<typeof OverlayTrigger>, 'overlay'>) => {
    return (
        <OverlayTrigger
            {...props}
            delayShow={delayShow}
            placement={placement}
            overlay={
                <Tooltip
                    id={id}
                    arrowOffsetTop={arrowOffsetTop}
                    className={className}
                    placement={placement}
                >
                    {content}
                </Tooltip>
            }
        >
            {children}
        </OverlayTrigger>
    );
};

export default memo(SimpleTooltip);

export function useSynchronizedImmediate(): [Partial<ComponentProps<typeof SimpleTooltip>>, (isImmediate: boolean) => void] {
    const [isImmediate, setImmediate] = useState(false);

    return [
        {
            onEntered: () => setImmediate(true),
            animation: !isImmediate,
            delayShow: isImmediate ? 0 : undefined,
        },
        setImmediate,
    ];
}
