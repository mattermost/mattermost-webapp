// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';

type Props = {
    children?: JSX.Element;
}

const SystembusCanvasWidget = ({children}: Props): JSX.Element => {
    return (
        <div className='systembus__ctr'>
            {children}
        </div>

    );
};

export default SystembusCanvasWidget;
