// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/* eslint-disable react/prop-types */

import React from 'react';
import {Tab, Tabs} from 'react-bootstrap';

import EmojiIcon from 'components/widgets/icons/emoji_icon';
import GfycatIcon from 'components/widgets/icons/gfycat_icon';
import EmojiPicker from 'components/emoji_picker';
import GifPicker from 'components/gif_picker/gif_picker';

type Mode = 'EMOJI_AND_GIF' | 'ONLY_EMOJI' | 'ONLY_GIF';

interface EmojiPickerTabsProps {
    mode: Mode;
}

const EmojiPickerTabs: React.FC<EmojiPickerTabsProps> = ({
    mode,
}) => {
    const emojiPickerIfEnabled = (mode === 'EMOJI_AND_GIF' || mode === 'ONLY_EMOJI') && (
        <EmojiPicker/>
    );

    const gifPickerIfEnabled = (mode === 'EMOJI_AND_GIF' || mode === 'ONLY_GIF') && (
        <GifPicker/>
    );

    return mode === 'EMOJI_AND_GIF' ? (
        <Tabs
            id='emoji-picker-tabs'
            justified={true}
            mountOnEnter={true}
            unmountOnExit={true}
            defaultActiveKey={1}
        >
            <Tab
                title={<EmojiIcon/>}
                eventKey={1}
            >
                {emojiPickerIfEnabled}
            </Tab>
            <Tab
                title={<GfycatIcon/>}
                eventKey={2}
            >
                {gifPickerIfEnabled}
            </Tab>
        </Tabs>
    ) : (
        <>
            {emojiPickerIfEnabled}
            {gifPickerIfEnabled}
        </>
    );
};

export default EmojiPickerTabs;
