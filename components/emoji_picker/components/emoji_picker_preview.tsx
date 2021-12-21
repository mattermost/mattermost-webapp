// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import {Emoji, SystemEmoji} from 'mattermost-redux/types/emojis';
import {getEmojiImageUrl} from 'mattermost-redux/utils/emoji_utils';

import imgTrans from 'images/img_trans.gif';

type Props = {
    emoji?: Emoji;
}

export default class EmojiPickerPreview extends React.PureComponent<Props> {
    isSystemEmoji(emoji: Emoji) {
        return (emoji as SystemEmoji).short_names && (emoji as SystemEmoji).image !== 'mattermost';
    }

    render(): React.ReactNode {
        const emoji = this.props.emoji;

        if (emoji) {
            let name;
            let aliases;
            let previewImage;

            if (this.isSystemEmoji(emoji)) {
                // This is a system emoji which only has a list of aliases
                aliases = emoji.short_names;

                previewImage = (
                    <span className='sprite-preview'>
                        <img
                            id='emojiPickerSpritePreview'
                            alt={'emoji category image'}
                            src={imgTrans}
                            className={'emojisprite-preview emoji-category-' + emoji.category + ' emoji-' + emoji.image}
                            loading='lazy'
                        />
                    </span>
                );
            } else {
                // This is a custom emoji that matches the model on the server
                name = emoji.name;
                aliases = [name];
                previewImage = (
                    <img
                        id='emojiPickerSpritePreview'
                        alt={'emoji preview image'}
                        className='emoji-picker__preview-image'
                        src={getEmojiImageUrl(emoji)}
                        loading='lazy'
                    />
                );
            }

            return (
                <div className='emoji-picker__preview'>
                    <div className='emoji-picker__preview-image-box'>
                        {previewImage}
                    </div>
                    <div className='emoji-picker__preview-image-label-box'>
                        <span className='emoji-picker__preview-name'>{':' + aliases?.join(': :') + ':'}</span>
                    </div>
                </div>
            );
        }

        return (
            <div className='emoji-picker__preview emoji-picker__preview-placeholder'>
                <FormattedMessage
                    id='emoji_picker.emojiPicker'
                    defaultMessage='Select an Emoji'
                />
            </div>
        );
    }
}
