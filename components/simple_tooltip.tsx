// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {FC, memo, ReactNode} from 'react';
import {Tooltip} from 'react-bootstrap';

import OverlayTrigger from 'components/overlay_trigger';

type Props = {
    id: string;
    content: ReactNode;
    children: ReactNode;
}

const SimpleTooltip: FC<Props> = ({id, content, children}: Props) => (
    <OverlayTrigger
        delayShow={500}
        placement='top'
        overlay={
            <Tooltip
                id={id}
                className='hidden-xs'
                placement='top'
            >
                {content}
            </Tooltip>
        }
    >
        {children}
    </OverlayTrigger>
);

export default memo(SimpleTooltip);
