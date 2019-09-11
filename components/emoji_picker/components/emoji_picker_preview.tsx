// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';
import cx from 'classnames';
// @ts-ignore
import {getEmojiImageUrl} from 'mattermost-redux/utils/emoji_utils';

import imgTrans from 'images/img_trans.gif';

export type SystemEmojiCategory = (
    | 'people'
    | 'nature'
    | 'foods'
    | 'activity'
    | 'places'
    | 'objects'
    | 'symbols'
    | 'flags'
    | 'custom'
);

export interface SystemEmoji {
    aliases: string[];
    batch: string;
    category: SystemEmojiCategory;
    filename: string;
    offset: null;
    visible: boolean;
}

export interface CustomEmoji {
    id: string;
    aliases: string[];
    category: 'custom';
    filename: string;
    name: string;
    offset: null;
    visible: boolean;
}

interface EmojiPickerPreviewProps {
    emoji?: SystemEmoji | CustomEmoji;
}

const EmojiPickerPreview: React.FC<EmojiPickerPreviewProps> = ({ emoji }) => (
    <div className={cx(
        'emoji-picker__preview',
        !emoji && 'emoji-picker__preview-placeholder',
    )}>
        {emoji ? (
        <>
            <div className='emoji-picker__preview-image-box'>
                {'batch' in emoji ? (
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
                    {'name' in emoji ? emoji.name : emoji.aliases[0]}
                </span>
                <span
                    id='emojiPickerAliasesPreview'
                    className='emoji-picker__preview-aliases'
                >
                    {':' + emoji.aliases[0] + ':'}
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
