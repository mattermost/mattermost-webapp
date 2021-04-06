// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {PropsWithChildren, CSSProperties} from 'react';

import './story_box.scss';

type Props = {
    label?: string;
    containerStyle?: CSSProperties;
};

const StoryItem = ({
    label,
    containerStyle,
    children,
}: PropsWithChildren<Props>) => {
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
