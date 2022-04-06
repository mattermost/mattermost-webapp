// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState} from 'react';
import classNames from 'classnames';
import {Tab, Tabs} from 'react-bootstrap';

import {Emoji} from 'mattermost-redux/types/emojis';

import EmojiIcon from 'components/widgets/icons/emoji_icon';
import GfycatIcon from 'components/widgets/icons/gfycat_icon';
import {makeAsyncComponent} from 'components/async_load';
import EmojiPicker from 'components/emoji_picker';
import EmojiPickerHeader from 'components/emoji_picker/components/emoji_picker_header';

const GifPicker = makeAsyncComponent('GifPicker', React.lazy(() => import('components/gif_picker/gif_picker.jsx')));

enum OverlayPositions {
    TOP = 'top',
    BOTTOM= 'bottom',
    LEFT = 'left',
    RIGHT = 'right',
}

type Props = {
    style?: any;
    rightOffset: number;
    topOffset: number;
    leftOffset?: number;
    placement?: OverlayPositions;
    customEmojis?: any;
    onEmojiClose: (e?: React.MouseEvent<HTMLElement, MouseEvent>) => void;
    onEmojiClick: (emoji: Emoji) => void;
    onGifClick?: (gif: string) => void;
    enableGifPicker: boolean;
}

const EmojiPickerTabs = ({
    rightOffset = 0,
    topOffset = 0,
    leftOffset = 0,
    onEmojiClick,
    onEmojiClose,
    onGifClick,
    placement,
    style,
    enableGifPicker,
}: Props) => {
    const [filter, setFilter] = useState('');
    const [emojiTabVisible, setEmojiTabVisible] = useState(true);

    const handleEnterEmojiTab = () => setEmojiTabVisible(true);

    const handleExitEmojiTab = () => setEmojiTabVisible(false);

    const handleEmojiPickerClose = () => onEmojiClose();

    const handleFilterChange = (filter: any) => setFilter(filter);

    let pickerStyle;
    if (style && !(style.left === 0 && style.top === 0)) {
        if (placement === 'top' || placement === 'bottom') {
            // Only take the top/bottom position passed by React Bootstrap since we want to be right-aligned
            pickerStyle = {
                top: style.top,
                bottom: style.bottom,
                right: rightOffset,
            };
        } else {
            pickerStyle = {...style};
        }

        pickerStyle.top = topOffset + (pickerStyle.top || 0);

        if (pickerStyle.left) {
            pickerStyle.left += leftOffset;
        }
    }

    if (enableGifPicker && onGifClick) {
        const title = (
            <div className={'custom-emoji-tab__icon__text'}>
                <EmojiIcon
                    className='custom-emoji-tab__icon'
                />
                <div>
                    {'Emojis'}
                </div>
            </div>
        );
        return (
            <Tabs
                defaultActiveKey={1}
                id='emoji-picker-tabs'
                style={pickerStyle}
                className={classNames('emoji-picker', {bottom: placement === 'bottom'})}
                justified={true}
            >
                <EmojiPickerHeader handleEmojiPickerClose={handleEmojiPickerClose}/>
                <Tab
                    eventKey={1}
                    onEnter={handleEnterEmojiTab}
                    onExit={handleExitEmojiTab}
                    title={title}
                    tabClassName={'custom-emoji-tab'}
                >
                    <EmojiPicker
                        filter={filter}
                        visible={emojiTabVisible}
                        onEmojiClick={onEmojiClick}
                        handleFilterChange={handleFilterChange}
                    />
                </Tab>
                <Tab
                    eventKey={2}
                    title={<GfycatIcon/>}
                    mountOnEnter={true}
                    unmountOnExit={true}
                    tabClassName={'custom-emoji-tab'}
                >
                    <GifPicker
                        onGifClick={onGifClick}
                        defaultSearchText={filter}
                        handleSearchTextChange={handleFilterChange}
                    />
                </Tab>
            </Tabs>
        );
    }

    return (
        <div
            id='emojiPicker'
            style={pickerStyle}
            className={classNames('a11y__popup emoji-picker emoji-picker--single', {bottom: placement === 'bottom'})}
        >
            <EmojiPickerHeader handleEmojiPickerClose={handleEmojiPickerClose}/>
            <EmojiPicker
                filter={filter}
                visible={emojiTabVisible}
                onEmojiClick={onEmojiClick}
                handleFilterChange={handleFilterChange}
            />
        </div>
    );
};

export default EmojiPickerTabs;
