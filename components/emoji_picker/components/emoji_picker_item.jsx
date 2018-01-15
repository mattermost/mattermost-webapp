// Copyright (c) 2016-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import debounce from 'lodash/debounce';

import EmojiStore from 'stores/emoji_store.jsx';

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
        containerBottom: PropTypes.number.isRequired
    };

    constructor(props) {
        super(props);
        this.handleMouseOver = this.handleMouseOver.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.handleMouseOverThrottle = debounce(this.handleMouseOver, EMOJI_LAZY_LOAD_SCROLL_THROTTLE, {leading: true, trailing: true});
    }
    shouldComponentUpdate(nextProps) {
        return nextProps.isSelected !== this.props.isSelected;
    }
    emojiItemRef = (emojiItem) => {
        this.emojiItem = emojiItem;
    };
    componentWillReceiveProps(nextProps) {
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

    handleMouseOver() {
        if (!this.props.isSelected) {
            this.props.onItemOver(this.props.categoryIndex, this.props.emojiIndex);
        }
    }

    handleClick() {
        this.props.onItemClick(this.props.emoji);
    }

    render() {
        const {emoji} = this.props;
        let item = null;
        let itemClassName = 'emoji-picker__item';
        itemClassName += this.props.isSelected ? ' selected' : '';
        let spriteClassName = 'emojisprite';
        spriteClassName += ' emoji-category-' + emoji.category + '-' + emoji.batch;
        spriteClassName += ' emoji-' + emoji.filename;

        if (emoji.category && emoji.batch) {
            item = (
                <div
                    className={itemClassName}
                    ref={this.emojiItemRef}
                >
                    <img
                        src='/static/images/img_trans.gif'
                        className={spriteClassName}
                        onMouseOver={this.handleMouseOverThrottle}
                        onClick={this.handleClick}
                    />
                </div>
            );
        } else {
            item = (
                <div
                    className={itemClassName}
                    ref={this.emojiItemRef}
                >
                    <img
                        src={EmojiStore.getEmojiImageUrl(emoji)}
                        className={spriteClassName}
                        onMouseOver={this.handleMouseOver}
                        onClick={this.handleClick}
                    />
                </div>
            );
        }

        return item;
    }
}
