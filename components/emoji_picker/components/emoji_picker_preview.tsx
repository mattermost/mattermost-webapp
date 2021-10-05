// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';
import {Link} from 'react-router-dom';

import {getEmojiImageUrl} from 'mattermost-redux/utils/emoji_utils';
import AnyTeamPermissionGate from 'components/permissions_gates/any_team_permission_gate';
import Permissions from 'mattermost-redux/constants/permissions';

import imgTrans from 'images/img_trans.gif';
import {CustomEmoji, Emoji, SystemEmoji} from 'mattermost-redux/types/emojis';

type Props = {
    emoji?: Emoji;
    customEmojisEnabled?: boolean;
    currentTeamName: string;
}

export default class EmojiPickerPreview extends React.PureComponent<Props> {
    customEmojis = () => {
        if (!this.props.customEmojisEnabled) {
            return null;
        }
        if (!this.props.currentTeamName) {
            return null;
        }
        return (
            <AnyTeamPermissionGate permissions={[Permissions.CREATE_EMOJIS]}>
                <div className='emoji-picker__custom'>
                    <Link
                        className='btn btn-link'
                        to={`/${this.props.currentTeamName}/emoji`}
                    >
                        <FormattedMessage
                            id='emoji_picker.custom_emoji'
                            defaultMessage='Custom Emoji'
                        />
                    </Link>
                </div>
            </AnyTeamPermissionGate>
        );
    }

    render(): React.ReactNode {
        const emoji = this.props.emoji;

        if (emoji) {
            let name;
            let aliases;
            let previewImage;

            const {short_names: shortNames, image} = emoji as SystemEmoji;

            if (shortNames && image !== 'mattermost') {
                // This is a system emoji which only has a list of aliases
                name = shortNames[0];
                aliases = shortNames;

                previewImage = (
                    <span className='sprite-preview'>
                        <img
                            id='emojiPickerSpritePreview'
                            alt={'emoji category image'}
                            src={imgTrans}
                            className={'emojisprite-preview emoji-category-' + emoji.category + ' emoji-' + image}
                        />
                    </span>
                );
            } else {
                // This is a custom emoji that matches the model on the server
                const {name: emojiName} = (emoji as CustomEmoji);
                name = emojiName;
                aliases = [name];
                previewImage = (
                    <img
                        id='emojiPickerSpritePreview'
                        alt={'emoji preview image'}
                        className='emoji-picker__preview-image'
                        src={getEmojiImageUrl(emoji)}
                    />
                );
            }

            return (
                <div className='emoji-picker__footer'>
                    <div className='emoji-picker__preview'>
                        <div className='emoji-picker__preview-image-box'>
                            {previewImage}
                        </div>
                        <div className='emoji-picker__preview-image-label-box'>
                            <span className='emoji-picker__preview-name'>{':' + aliases.join(': :') + ':'}</span>
                        </div>
                    </div>
                    {this.customEmojis()}
                </div>
            );
        }

        return (
            <div className='emoji-picker__footer'>
                <div className='emoji-picker__preview emoji-picker__preview-placeholder'>
                    <FormattedMessage
                        id='emoji_picker.emojiPicker'
                        defaultMessage='Select an Emoji'
                    />
                </div>
                {this.customEmojis()}
            </div>
        );
    }
}
