// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React, {PureComponent} from 'react';
import {Tab, Tabs} from 'react-bootstrap';

import GifPicker from 'components/gif_picker/gif_picker.jsx';
import EmojiIcon from 'components/svg/emoji_icon';
import GfycatIcon from 'components/svg/gfycat_icon';

import EmojiPicker from './';

export default class EmojiPickerTabs extends PureComponent {
    static propTypes = {
        style: PropTypes.object,
        rightOffset: PropTypes.number,
        topOffset: PropTypes.number,
        placement: PropTypes.oneOf(['top', 'bottom', 'left']),
        customEmojis: PropTypes.object,
        onEmojiClick: PropTypes.func.isRequired,
        onGifClick: PropTypes.func,
        enableGifPicker: PropTypes.bool,
    };

    static defaultProps = {
        rightOffset: 0,
        topOffset: 0,
    };

    render() {
        let pickerStyle;
        if (this.props.style && !(this.props.style.left === 0 || this.props.style.top === 0)) {
            if (this.props.placement === 'top' || this.props.placement === 'bottom') {
                // Only take the top/bottom position passed by React Bootstrap since we want to be right-aligned
                pickerStyle = {
                    top: this.props.style.top,
                    bottom: this.props.style.bottom,
                    right: this.props.rightOffset,
                };
            } else {
                pickerStyle = {...this.props.style};
            }
        }

        if (pickerStyle && pickerStyle.top) {
            pickerStyle.top += this.props.topOffset;
        }

        let pickerClass = 'emoji-picker';
        if (this.props.placement === 'bottom') {
            pickerClass += ' bottom';
        }

        if (this.props.enableGifPicker && typeof this.props.onGifClick != 'undefined') {
            return (
                <Tabs
                    defaultActiveKey={1}
                    id='emoji-picker-tabs'
                    style={pickerStyle}
                    className={pickerClass}
                    justified={true}
                >
                    <Tab
                        eventKey={1}
                        title={<EmojiIcon/>}
                    >
                        <EmojiPicker
                            style={this.props.style}
                            onEmojiClick={this.props.onEmojiClick}
                            rightOffset={this.props.rightOffset}
                            topOffset={this.props.topOffset}
                            placement={this.props.placement}
                            customEmojis={this.props.customEmojis}
                        />
                    </Tab>
                    <Tab
                        eventKey={2}
                        title={<GfycatIcon/>}
                        mountOnEnter={true}
                        unmountOnExit={true}
                    >
                        <GifPicker
                            onGifClick={this.props.onGifClick}
                            rightOffset={this.props.rightOffset}
                            topOffset={this.props.topOffset}
                        />
                    </Tab>
                </Tabs>
            );
        }
        return (
            <div
                style={pickerStyle}
                className={pickerClass}
            >
                <EmojiPicker
                    style={this.props.style}
                    onEmojiClick={this.props.onEmojiClick}
                    rightOffset={this.props.rightOffset}
                    topOffset={this.props.topOffset}
                    placement={this.props.placement}
                    customEmojis={this.props.customEmojis}
                />
            </div>
        );
    }
}
