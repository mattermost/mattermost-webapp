// Copyright (c) 2016-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';

// import EmojiPickerCategory from "./components/emoji_picker_category";
// import EmojiPickerItem from "./components/emoji_picker_item";


export default class EmojiPickerSection extends React.Component {
    static propTypes = {
        categoryName: PropTypes.string.isRequired,
        categoryMessage: PropTypes.string.isRequired,
        children: PropTypes.any
    };

    static defaultProps = {
    };

    constructor(props) {
        super(props);

        // All props are primitives or treated as immutable
        this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
        this.handleItemOver = this.handleItemOver.bind(this);
        this.handleItemClick = this.handleItemClick.bind(this);
    }
    handleItemOver(emoji) {
        this.setState({
            selected: emoji
        });
    }
    handleItemClick(emoji) {
        this.props.onEmojiClick(emoji);
    }

    render() {
        return (
            <div>
                <div className='emoji-picker-items__container'>
                    <div
                        className='emoji-picker__category-header'
                        id={`emojipickercat-${this.props.categoryName}`}
                    >
                        {this.props.categoryMessage}
                    </div>
                </div>
                <div className='emoji-picker-items__container'>
                    {this.props.children}
                </div>
            </div>
        );
    }
}
