// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

interface ToggleFormattingBarProps {
    onClick: React.MouseEventHandler;
}

export const ToggleFormattingBar = (props: ToggleFormattingBarProps): JSX.Element => {
    const {onClick} = props;
    return (
        <div>
            <button
                type='button'
                id='fileUploadButton'
                onClick={onClick}
                className='style--none post-action icon icon--attachment'
            >
                {'Aa'}
            </button>
        </div>
    );
};
