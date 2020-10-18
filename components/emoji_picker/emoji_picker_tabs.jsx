// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React, {PureComponent} from 'react';
import {Tab, Tabs} from 'react-bootstrap';

import GifPicker from 'components/gif_picker/gif_picker.jsx';
import EmojiIcon from 'components/widgets/icons/emoji_icon';
import GfycatIcon from 'components/widgets/icons/gfycat_icon';

import EmojiPickerHeader from './components/emoji_picker_header';

import EmojiPicker from './';

export default class EmojiPickerTabs extends PureComponent {
    static propTypes = {
        style: PropTypes.object,
        rightOffset: PropTypes.number,
        topOffset: PropTypes.number,
        placement: PropTypes.oneOf(['top', 'bottom', 'left']),
        customEmojis: PropTypes.object,
        onEmojiClose: PropTypes.func.isRequired,
        onEmojiClick: PropTypes.func.isRequired,
        onGifClick: PropTypes.func,
        enableGifPicker: PropTypes.bool,
    };

    static defaultProps = {
        rightOffset: 0,
        topOffset: 0,
    };

    constructor(props) {
        super(props);

        this.state = {
            emojiTabVisible: true,
            filter: '',
        };
    }

    handleEnterEmojiTab = () => {
        this.setState({
            emojiTabVisible: true,
        });
    };

    handleExitEmojiTab = () => {
        this.setState({
            emojiTabVisible: false,
        });
    };

    handleEmojiPickerClose = () => {
        this.props.onEmojiClose();
    };

    handleFilterChange = (filter) => {
        this.setState({filter});
    };

    render() {
        let pickerStyle;
        if (this.props.style && !(this.props.style.left === 0 && this.props.style.top === 0)) {
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

            if (pickerStyle.top) {
                pickerStyle.top += this.props.topOffset;
            }
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
                    <EmojiPickerHeader handleEmojiPickerClose={this.handleEmojiPickerClose}/>
                    <Tab
                        eventKey={1}
                        onEnter={this.handleEnterEmojiTab}
                        onExit={this.handleExitEmojiTab}
                        title={<EmojiIcon/>}
                    >
                        <EmojiPicker
                            style={this.props.style}
                            onEmojiClose={this.props.onEmojiClose}
                            onEmojiClick={this.props.onEmojiClick}
                            customEmojis={this.props.customEmojis}
                            visible={this.state.emojiTabVisible}
                            filter={this.state.filter}
                            handleFilterChange={this.handleFilterChange}
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
                            defaultSearchText={this.state.filter}
                            handleSearchTextChange={this.handleFilterChange}
                        />
                    </Tab>
                </Tabs>
            );
        }
        return (
            <div
                id='emojiPicker'
                style={pickerStyle}
                className={`a11y__popup ${pickerClass} emoji-picker--single`}
            >
                <EmojiPickerHeader handleEmojiPickerClose={this.handleEmojiPickerClose}/>
                <EmojiPicker
                    style={this.props.style}
                    onEmojiClose={this.props.onEmojiClose}
                    onEmojiClick={this.props.onEmojiClick}
                    customEmojis={this.props.customEmojis}
                    filter={this.state.filter}
                    handleFilterChange={this.handleFilterChange}
                />
            </div>
        );
    }
}
