// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/* eslint-disable react/prop-types */

import React from 'react';
import {FormattedMessage} from 'react-intl';
import cx from 'classnames';
import {getEmojiImageUrl, isSystemEmoji} from 'mattermost-redux/utils/emoji_utils';
import {Emoji} from 'mattermost-redux/types/emojis';

import imgTrans from 'images/img_trans.gif';
import {getEmojiName} from 'utils/emoji_utils';

interface EmojiPickerPreviewProps {
    emoji?: Emoji;
}

const EmojiPickerPreview: React.FC<EmojiPickerPreviewProps> = ({emoji}) => (
    <div
        className={cx(
            'emoji-picker__preview',
            !emoji && 'emoji-picker__preview-placeholder',
        )}
    >
        {emoji ? (
            <>
                <div className='emoji-picker__preview-image-box'>
                    {isSystemEmoji(emoji) ? (
                        <span className='sprite-preview'>
                            <img
                                id='emojiPickerSpritePreview'
                                alt={'emoji category image'}
                                src={imgTrans}
                                className={cx(
                                    'emojisprite-preview',
                                    `emoji-category-${emoji.category}-${emoji.batch}`,
                                    `emoji-${emoji.filename}`,
                                )}
                            />
                        </span>
                    ) : (
                        <img
                            id='emojiPickerSpritePreview'
                            alt={'emoji preview image'}
                            className='emoji-picker__preview-image'
                            src={getEmojiImageUrl(emoji)}
                        />
                    )}
                </div>
                <div className='emoji-picker__preview-image-label-box'>
                    <span className='emoji-picker__preview-name'>
                        {getEmojiName(emoji)}
                    </span>
                    <span
                        id='emojiPickerAliasesPreview'
                        className='emoji-picker__preview-aliases'
                    >
                        {`:${getEmojiName(emoji)}:`}
                    </span>
                </div>
            </>
        ) : (
            <FormattedMessage
                id='emoji_picker.emojiPicker'
                defaultMessage='Emoji Picker'
            />
        )}
    </div>
);

export default EmojiPickerPreview;
