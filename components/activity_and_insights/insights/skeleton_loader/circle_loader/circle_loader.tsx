// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {memo} from 'react';

import '../skeleton_loader.scss';

type Props = {
    size: number;
};

const CircleLoader = (props: Props) => {
    return (
        <div
            className='skeleton-loader circle'
            style={{
                width: `${props.size}px`,
                height: `${props.size}px`,
            }}
        />
    );
};

export default memo(CircleLoader);
