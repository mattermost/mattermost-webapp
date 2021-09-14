// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo, useState} from 'react';

import './panel.scss';

type Props = {
    children: ({hover}: {hover: boolean}) => React.ReactNode;
};

function Panel({children}: Props) {
    const [hover, setHover] = useState(false);

    const handleMouseEnter = () => {
        setHover(true);
    };

    const handleMouseLeave = () => {
        setHover(false);
    };

    return (
        <article
            className='Panel'
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {children({hover})}
        </article>
    );
}

export default memo(Panel);
