// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback} from 'react';

import './chip.scss';

type Props = {
    index: number;
    label: string;
    onRemove: (index: number) => void;
};

function Chip({index, label, onRemove}: Props) {
    const handleOnRemove = useCallback(() => {
        onRemove(index);
    }, [index, onRemove]);

    return (
        <div className='command-palette-input-chip'>
            {label}
            <button
                className='style--none'
                onClick={handleOnRemove}
            >
                <i className='icon icon-close icon-12'/>
            </button>
        </div>
    );
}

export default Chip;
