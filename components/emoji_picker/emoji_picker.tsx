// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/* eslint-disable react/prop-types */

import React, {useRef} from 'react';

interface EmojiPickerProps {
    hasRecentlyUsed?: boolean;
}

const EmojiPicker: React.FC<EmojiPickerProps> = ({
}) => {
    const searchInputRef = useRef<HTMLInputElement>();

    return (
        <div
            className='emoji-picker__inner'
            role='application'
        >
            <div
                aria-live='assertive'
                className='sr-only'
            >
                {/* TODO */}
            </div>
            <EmojiPickerSearchInput
                ref={searchInputRef}
            />
            <EmojiPickerCategoryList/>
            <EmojiPickerPreview emoji={}/>
        </div>
    );
};

export default EmojiPicker;
