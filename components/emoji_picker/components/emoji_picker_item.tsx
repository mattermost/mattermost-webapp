// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {injectIntl, IntlShape} from 'react-intl';
import debounce from 'lodash/debounce';

import {getEmojiImageUrl} from 'mattermost-redux/utils/emoji_utils';

import imgTrans from 'images/img_trans.gif';
import {Emoji, SystemEmoji} from 'mattermost-redux/types/emojis';

const SCROLLING_ADDITIONAL_VISUAL_SPACING = 10; // to make give the emoji some visual 'breathing room'
const EMOJI_LAZY_LOAD_SCROLL_THROTTLE = 150;

type Props = {
    emoji: Emoji;
    onItemOver: (categoryIndex: number, emojiIndex: number) => void;
    onItemClick: (emoji: Emoji) => void;
    category: string;
    isSelected?: boolean;
    categoryIndex: number;
    emojiIndex: number;
    containerRef: HTMLDivElement;
    containerTop: number;
    containerBottom: number;
    intl: IntlShape;
}

class EmojiPickerItem extends React.Component<Props> {
    private emojiItem: HTMLDivElement | undefined;

    shouldComponentUpdate(nextProps: Props) {
        return nextProps.isSelected !== this.props.isSelected;
    }

    emojiItemRef = (emojiItem: HTMLDivElement) => {
        this.emojiItem = emojiItem;
    };

    emojiName = () => {
        const name = 'short_name' in this.props.emoji ? this.props.emoji.short_name : this.props.emoji.name;
        const {formatMessage} = this.props.intl;
        return formatMessage({
            id: 'emoji_picker_item.emoji_aria_label',
            defaultMessage: '{emojiName} emoji',
        },
        {
            emojiName: name.replace(/_/g, ' '),
        });
    }

    componentDidUpdate(prevProps: Props) {
        if (!prevProps.isSelected && this.props.isSelected) {
            const topOfTheEmojiItem = this.emojiItem!.offsetTop;
            const bottomOfTheEmojiItem = topOfTheEmojiItem + this.emojiItem!.offsetHeight;
            const {containerRef, containerTop, containerBottom} = this.props;
            if (topOfTheEmojiItem < containerTop) {
                containerRef.scrollTop = topOfTheEmojiItem - SCROLLING_ADDITIONAL_VISUAL_SPACING;
            } else if (bottomOfTheEmojiItem > containerBottom) {
                containerRef.scrollTop = (bottomOfTheEmojiItem - containerRef.offsetHeight) + SCROLLING_ADDITIONAL_VISUAL_SPACING;
            }
        }
    }

    handleMouseOver = () => {
        if (!this.props.isSelected) {
            this.props.onItemOver(this.props.categoryIndex, this.props.emojiIndex);
        }
    };

    handleMouseOverThrottle = debounce(this.handleMouseOver, EMOJI_LAZY_LOAD_SCROLL_THROTTLE, {
        leading: true,
        trailing: true,
    });

    handleClick = () => {
        this.props.onItemClick(this.props.emoji);
    };

    isSystemEmoji(emoji: Emoji): emoji is SystemEmoji {
        return emoji.category && emoji.category !== 'custom';
    }

    render() {
        const {emoji} = this.props;

        let itemClassName = 'emoji-picker__item';
        if (this.props.isSelected) {
            itemClassName += ' selected';
        }

        let image;
        if (this.isSystemEmoji(emoji)) {
            let spriteClassName = 'emojisprite';
            spriteClassName += ' emoji-category-' + emoji.category;
            spriteClassName += ' emoji-' + emoji.image;
            image = (
                <img
                    alt={'emoji image'}
                    data-testid={emoji.short_names}
                    onMouseOver={this.handleMouseOverThrottle}
                    src={imgTrans}
                    className={spriteClassName}
                    onClick={this.handleClick}
                    id={'emoji-' + emoji.image}
                    aria-label={this.emojiName()}
                    role='button'
                />
            );
        } else {
            image = (
                <img
                    alt={'custom emoji image'}
                    onMouseOver={this.handleMouseOver}
                    src={getEmojiImageUrl(emoji)}
                    className={'emoji-category--custom'}
                    onClick={this.handleClick}
                />
            );
        }

        return (
            <div
                className={itemClassName}
                ref={this.emojiItemRef}
            >
                <div data-testid='emojiItem'>
                    {image}
                </div>
            </div>
        );
    }
}

export default injectIntl(EmojiPickerItem);
