// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {FC, CSSProperties} from 'react';

const style: CSSProperties = {
    display: 'flex',
    width: '100%',
    flexWrap: 'wrap',
};

const StoryGrid: FC = ({children}) => {
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
