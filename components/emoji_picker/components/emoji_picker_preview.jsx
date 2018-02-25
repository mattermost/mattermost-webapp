// Copyright (c) 2016-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';

import EmojiStore from 'stores/emoji_store.jsx';

export default class EmojiPickerPreview extends React.Component {
    static propTypes = {
        emoji: PropTypes.object,
    }

    render() {
        const emoji = this.props.emoji;

        if (emoji) {
            let name;
            let aliases;
            let previewImage;

            if (emoji.aliases && emoji.category && emoji.batch) {
                // This is a system emoji which only has a list of aliases
                name = emoji.aliases[0];
                aliases = emoji.aliases;

                previewImage = (
                    <span className='sprite-preview'>
                        <img
                            src='/static/images/img_trans.gif'
                            className={'emojisprite-preview emoji-category-' + emoji.category + '-' + emoji.batch + ' emoji-' + emoji.filename}
                        />
                    </span>
                );
            } else {
                // This is a custom emoji that matches the model on the server
                name = emoji.name;
                aliases = [emoji.name];
                previewImage = (
                    <img
                        className='emoji-picker__preview-image'
                        src={EmojiStore.getEmojiImageUrl(emoji)}
                    />
                );
            }

            return (
                <div className='emoji-picker__preview'>
                    <div className='emoji-picker__preview-image-box'>
                        {previewImage}
                    </div>
                    <div className='emoji-picker__preview-image-label-box'>
                        <span className='emoji-picker__preview-name'>{name}</span>
                        <span className='emoji-picker__preview-aliases'>
                            {':' + aliases[0] + ':'}
                        </span>
                    </div>
                </div>
            );
        }

        return (
            <div className='emoji-picker__preview emoji-picker__preview-placeholder'>
                <FormattedMessage
                    id='emoji_picker.emojiPicker'
                    defaultMessage='Emoji Picker'
                />
            </div>
        );
    }
}
