// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import debounce from 'lodash/debounce';
import {getEmojiImageUrl} from 'mattermost-redux/utils/emoji_utils';
import {intlShape} from 'react-intl';

import imgTrans from 'images/img_trans.gif';

const SCROLLING_ADDITIONAL_VISUAL_SPACING = 10; // to make give the emoji some visual 'breathing room'
const EMOJI_LAZY_LOAD_SCROLL_THROTTLE = 150;

export default class EmojiPickerItem extends React.Component {
    static propTypes = {
        emoji: PropTypes.object.isRequired,
        onItemOver: PropTypes.func.isRequired,
        onItemClick: PropTypes.func.isRequired,
        category: PropTypes.string.isRequired,
        isSelected: PropTypes.bool,
        categoryIndex: PropTypes.number.isRequired,
        emojiIndex: PropTypes.number.isRequired,
        containerRef: PropTypes.any,
        containerTop: PropTypes.number.isRequired,
        containerBottom: PropTypes.number.isRequired,
    };

    static contextTypes = {
        intl: intlShape.isRequired,
    };

    shouldComponentUpdate(nextProps) {
        return nextProps.isSelected !== this.props.isSelected;
    }

    emojiItemRef = (emojiItem) => {
        this.emojiItem = emojiItem;
    };

    emojiName = () => {
        const {formatMessage} = this.context.intl;
        return formatMessage({
            id: 'emoji_picker_item.emoji_aria_label',
            defaultMessage: '{emojiName} emoji',
        },
        {
            emojiName: this.props.emoji.aliases[0].replace(/_/g, ' '),
        });
    }

    UNSAFE_componentWillReceiveProps(nextProps) { // eslint-disable-line camelcase
        if (!this.props.isSelected && nextProps.isSelected) {
            const topOfTheEmojiItem = this.emojiItem.offsetTop;
            const bottomOfTheEmojiItem = topOfTheEmojiItem + this.emojiItem.offsetHeight;
            const {containerRef, containerTop, containerBottom} = nextProps;
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

    handleMouseOverThrottle = debounce(this.handleMouseOver, EMOJI_LAZY_LOAD_SCROLL_THROTTLE, {leading: true, trailing: true});

    handleClick = () => {
        this.props.onItemClick(this.props.emoji);
    };

    render() {
        const {emoji} = this.props;

        let itemClassName = 'emoji-picker__item';
        if (this.props.isSelected) {
            itemClassName += ' selected';
        }

        let spriteClassName = 'emojisprite';
        spriteClassName += ' emoji-category-' + emoji.category + '-' + emoji.batch;
        spriteClassName += ' emoji-' + emoji.filename;

        let image;
        if (emoji.category && emoji.batch) {
            image = (
                <img
                    alt={'emoji image'}
                    data-testid={emoji.aliases}
                    onMouseOver={this.handleMouseOverThrottle}
                    src={imgTrans}
                    className={spriteClassName}
                    onClick={this.handleClick}
                    id={'emoji-' + emoji.filename}
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
