// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {FC, CSSProperties} from 'react';

import './story_box.scss';

const StoryItem: FC<{label?: string; containerStyle?: CSSProperties}> = ({
    label,
    containerStyle,
    children,
}) => {
    return (
        <div
            className='StoryBox'
            style={{...containerStyle}}
        >
            {label && <span className='StoryBox___label'>{label}</span>}
            {children}
        </div>
    );
};

export default StoryItem;
