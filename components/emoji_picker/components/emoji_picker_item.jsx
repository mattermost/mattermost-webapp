// Copyright (c) 2016-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import EmojiStore from 'stores/emoji_store.jsx';

const SCROLLING_ADDT_VISUAL_SPACING = 10; // to make give the emoji some visual 'breathing room'

export default class EmojiPickerItem extends React.PureComponent {
    static propTypes = {
        emoji: PropTypes.object.isRequired,
        onItemOver: PropTypes.func.isRequired,
        onItemClick: PropTypes.func.isRequired,
        category: PropTypes.string.isRequired,
        isSelected: PropTypes.bool,
        categoryIndex: PropTypes.number.isRequired,
        emojiIndex: PropTypes.number.isRequired,
        container: PropTypes.any,
        containerTop: PropTypes.number.isRequired,
        containerBottom: PropTypes.number.isRequired
    };

    constructor(props) {
        super(props);
        this.handleMouseOver = this.handleMouseOver.bind(this);
        this.handleClick = this.handleClick.bind(this);
    }
    componentWillReceiveProps(nextProps) {
        if (!this.props.isSelected && nextProps.isSelected) {
            const topOfTheEmojiContainer = this.emojiItem.offsetTop;
            const heightOfTheEmojiContainer = this.emojiItem.offsetHeight + SCROLLING_ADDT_VISUAL_SPACING;
            if (topOfTheEmojiContainer < this.props.containerTop + heightOfTheEmojiContainer) {
                this.emojiItem.scrollIntoView();
                nextProps.container.scrollTop -= SCROLLING_ADDT_VISUAL_SPACING;
            } else if (topOfTheEmojiContainer > this.props.containerBottom - heightOfTheEmojiContainer) {
                this.emojiItem.scrollIntoView(false);
                nextProps.container.scrollTop += SCROLLING_ADDT_VISUAL_SPACING;
            }
        }
    }
    handleMouseOver() {
        this.props.onItemOver(this.props.categoryIndex, this.props.emojiIndex);
    }

    handleClick() {
        this.props.onItemClick(this.props.emoji);
    }

    render() {
        let item = null;
        const {emoji} = this.props;

        if (emoji.category && emoji.batch) {
            let className = 'emojisprite';

            className += ' emoji-category-' + emoji.category + '-' + emoji.batch;
            className += ' emoji-' + emoji.filename;
            className += this.props.isSelected ? ' selected' : '';

            item = (
                <div
                    className='emoji-picker__item'
                    ref={(emojiItem) => {
                        this.emojiItem = emojiItem;
                    }}
                >
                    <img
                        src='/static/images/img_trans.gif'
                        className={className}
                        onMouseOver={this.handleMouseOver}
                        onClick={this.handleClick}
                    />
                </div>
            );
        } else {
            item = (
                <span
                    onMouseOver={this.handleMouseOver}
                    onClick={this.handleClick}
                    className='emoji-picker__item-wrapper'
                    ref={(emojiItem) => {
                        this.emojiItem = emojiItem;
                    }}
                >
                    <img
                        className='emoji-picker__item emoticon'
                        src={EmojiStore.getEmojiImageUrl(emoji)}
                    />
                </span>
            );
        }

        return item;
    }
}
