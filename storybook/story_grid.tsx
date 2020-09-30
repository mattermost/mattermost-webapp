// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {ReactNode, CSSProperties} from 'react';

const style: CSSProperties = {
    display: 'flex',
    width: '100%',
    flexWrap: 'wrap',
};

type Props = {
    children?: ReactNode;
}

const StoryGrid = ({children}: Props) => {
    return (
        <div
            className='StoryGrid'
            style={style}
        >
            {children}
        </div>
    );
};

export default StoryGrid;
