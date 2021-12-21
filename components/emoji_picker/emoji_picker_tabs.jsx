// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React, {PureComponent} from 'react';
import {Tab, Tabs} from 'react-bootstrap';

import EmojiIcon from 'components/widgets/icons/emoji_icon';
import GfycatIcon from 'components/widgets/icons/gfycat_icon';
import {makeAsyncComponent} from 'components/async_load';

import EmojiPicker from 'components/emoji_picker';
import EmojiPickerHeader from 'components/emoji_picker/components/emoji_picker_header';

const GifPicker = makeAsyncComponent('GifPicker', React.lazy(() => import('components/gif_picker/gif_picker.jsx')));

export default class EmojiPickerTabs extends PureComponent {
    static propTypes = {
        style: PropTypes.object,
        rightOffset: PropTypes.number,
        topOffset: PropTypes.number,
        leftOffset: PropTypes.number,
        placement: PropTypes.oneOf(['top', 'bottom', 'left', 'right']),
        customEmojis: PropTypes.object,
        onEmojiClose: PropTypes.func.isRequired,
        onEmojiClick: PropTypes.func.isRequired,
        onGifClick: PropTypes.func,
        enableGifPicker: PropTypes.bool,
    };

    static defaultProps = {
        rightOffset: 0,
        topOffset: 0,
        leftOffset: 0,
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

            pickerStyle.top = pickerStyle.top ? pickerStyle.top + this.props.topOffset : this.props.topOffset;

            if (pickerStyle.left) {
                pickerStyle.left += this.props.leftOffset;
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
                        title={
                            <div className={'custom-emoji-tab__icon__text'}>
                                <EmojiIcon
                                    className='custom-emoji-tab__icon'
                                />
                                <div>
                                    {'Emojis'}
                                </div>
                            </div>
                        }
                        tabClassName={'custom-emoji-tab'}
                    >
                        <EmojiPicker
                            filter={this.state.filter}
                            visible={this.state.emojiTabVisible}
                            onEmojiClick={this.props.onEmojiClick}
                            handleFilterChange={this.handleFilterChange}
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
                    filter={this.state.filter}
                    visible={this.state.emojiTabVisible}
                    onEmojiClick={this.props.onEmojiClick}
                    handleFilterChange={this.handleFilterChange}
                />
            </div>
        );
    }
}
